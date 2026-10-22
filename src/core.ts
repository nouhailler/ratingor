import {z} from 'zod';
import Papa from 'papaparse';
export const agencies = {sp:'S&P Global Ratings',moodys:'Moody’s',fitch:'Fitch Ratings',scope:'Scope Ratings',dbrs:'Morningstar DBRS'};
export const types = {'issuer-long-term':'Émetteur long terme','issuer-short-term':'Émetteur court terme','senior-unsecured':'Dette senior non garantie',subordinated:'Dette subordonnée',deposit:'Dépôts'};
const id=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const text=z.string().trim().min(1).max(250);
const url=z.string().max(2048).refine(v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}},'URL HTTPS sans identifiants requise');
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v&&v<=new Date().toISOString().slice(0,10),'Date inexistante ou future');
const schema=z.object({id,companyId:id,companyName:text,aliases:z.array(text).max(30),country:z.string().regex(/^[A-Z]{2}$/),sector:z.enum(['company','bank']),agencyId:z.enum(['sp','moodys','fitch','scope','dbrs']),type:z.enum(['issuer-long-term','issuer-short-term','senior-unsecured','subordinated','deposit']),instrument:text.nullable(),currency:z.string().regex(/^[A-Z]{3}$/).nullable(),grade:text.nullable(),outlook:z.enum(['stable','positive','negative','developing','unknown']),action:z.enum(['assigned','affirmed','upgraded','downgraded','withdrawn','corrected']),publishedAt:day.nullable(),collectedAt:z.string().datetime().refine(v=>Date.parse(v)<=Date.now(),'Collecte future'),sourceUrl:url,verification:z.enum(['imported','verified']),rights:z.enum(['redistributable','personal-only','unknown']),rightsEvidence:url.nullable(),supersedes:id.nullable()}).strict().superRefine((v,c)=>{
 if(v.action==='withdrawn' ? v.grade!==null : v.grade===null)c.addIssue({code:'custom',message:'Note requise sauf retrait (note null)'});
 if(v.rights==='redistributable'&&!v.rightsEvidence)c.addIssue({code:'custom',message:'Preuve des droits requise'});
 if((v.action==='corrected')!==!!v.supersedes)c.addIssue({code:'custom',message:'Une correction doit référencer la ligne remplacée'});
 if(v.publishedAt&&v.publishedAt>v.collectedAt.slice(0,10))c.addIssue({code:'custom',message:'Publication postérieure à la collecte'});
 if(v.type!=='issuer-long-term'&&v.type!=='issuer-short-term'&&!v.instrument)c.addIssue({code:'custom',message:'Instrument requis pour ce type'});
});
export type RatingEvent=z.infer<typeof schema>;
export type Batch={id:string;at:string;accepted:number;duplicates:number;rejected:number};
export type State={version:1;events:RatingEvent[];batches:Batch[];favorites:string[];watchlist:string[];staleDays:number};
export const empty=():State=>({version:1,events:[],batches:[],favorites:[],watchlist:[],staleDays:180});
export const series=(e:RatingEvent)=>JSON.stringify([e.companyId,e.agencyId,e.type,e.instrument,e.currency]);
const signature=(e:RatingEvent)=>JSON.stringify({...e,id:'',collectedAt:'',verification:'',rights:'',rightsEvidence:''});
export type Preview={accepted:RatingEvent[];duplicates:number;errors:{row:number;message:string}[]};
export function parseImport(raw:string,format:'json'|'csv',existing:RatingEvent[]=[]):Preview{
 if(new TextEncoder().encode(raw).length>2*1024*1024)throw Error('Fichier trop volumineux (2 Mo maximum)');
 let rows:unknown[];
 if(format==='json'){const value=JSON.parse(raw);if(!Array.isArray(value))throw Error('Un tableau JSON est requis');rows=value;}
 else {const result=Papa.parse<Record<string,string>>(raw,{header:true,skipEmptyLines:'greedy'});if(result.errors.length)throw Error(result.errors.map(e=>e.message).join('; '));rows=result.data.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,k==='aliases'?v.split('|').filter(Boolean):v===''?null:v])));}
 if(rows.length>10000)throw Error('10 000 lignes maximum');
 const report:Preview={accepted:[],duplicates:0,errors:[]};const all=[...existing];
 rows.forEach((row,i)=>{const parsed=schema.safeParse(row);if(!parsed.success){report.errors.push({row:i+1,message:parsed.error.issues.map(x=>`${x.path.join('.')}: ${x.message}`).join('; ')});return;}
 const e=parsed.data;const same=all.find(x=>x.id===e.id);
 if(same){if(JSON.stringify(same)===JSON.stringify(e))report.duplicates++;else report.errors.push({row:i+1,message:'Identifiant déjà utilisé avec un contenu différent'});return;}
 if(all.some(x=>signature(x)===signature(e))){report.duplicates++;return;}
 const company=all.find(x=>x.companyId===e.companyId);
 if(company&&JSON.stringify([company.companyName,company.aliases,company.country,company.sector])!==JSON.stringify([e.companyName,e.aliases,e.country,e.sector])){report.errors.push({row:i+1,message:'Métadonnées entreprise incompatibles avec cet identifiant'});return;}
 if(e.supersedes){const target=all.find(x=>x.id===e.supersedes);if(!target||series(target)!==series(e)||all.some(x=>x.supersedes===e.supersedes)){report.errors.push({row:i+1,message:'Correction : cible absente, déjà corrigée ou série différente (placer la cible avant la correction)'});return;}}
 all.push(e);report.accepted.push(e);
 });return report;
}
export function current(events:RatingEvent[]){const replaced=new Set(events.map(e=>e.supersedes));const map=new Map<string,RatingEvent>();
 for(const e of events.filter(e=>!replaced.has(e.id))){const key=series(e);const old=map.get(key);const rank=(x:RatingEvent)=>`${x.publishedAt??'0000-00-00'}|${x.collectedAt}|${x.id}`;if(!old||rank(e)>rank(old))map.set(key,e);}return [...map.values()];}
export function uncertain(e:RatingEvent,events:RatingEvent[]){return events.some(x=>series(x)===series(e)&&!x.publishedAt&&!events.some(c=>c.supersedes===x.id));}
export type Filters={query:string;agency:string;type:string;grade:string;outlook:string;from:string;to:string};
export const initialFilters:Filters={query:'',agency:'',type:'',grade:'',outlook:'',from:'',to:''};
export function filterEvents(events:RatingEvent[],f:Filters){const q=f.query.toLocaleLowerCase();return events.filter(e=>[e.companyName,e.companyId,e.country,...e.aliases].join(' ').toLocaleLowerCase().includes(q)&&(!f.agency||e.agencyId===f.agency)&&(!f.type||e.type===f.type)&&(!f.grade||e.grade===f.grade)&&(!f.outlook||e.outlook===f.outlook)&&(!f.from||!!e.publishedAt&&e.publishedAt>=f.from)&&(!f.to||!!e.publishedAt&&e.publishedAt<=f.to));}
export function exportable(events:RatingEvent[]){const allowed=events.filter(e=>e.rights==='redistributable'&&e.rightsEvidence);const ids=new Set(allowed.map(e=>e.id));let result=allowed;let old=-1;while(old!==result.length){old=result.length;const kept=new Set(result.map(e=>e.id));result=result.filter(e=>!e.supersedes||ids.has(e.supersedes)&&kept.has(e.supersedes));}return result;}
export const sources=[
 ['ESMA ERP','https://registers.esma.europa.eu/publication/','manuel uniquement','Droits ERP et export non établis.'],
 ['ESMA CEREP','https://registers.esma.europa.eu/cerep-publication/','manuel uniquement','Statistiques agrégées ; pas de notes individuelles importables directement.'],
 ['S&P Global Ratings','https://www.spglobal.com/ratings/','manuel uniquement','Restrictions de redistribution ; aucune licence acquise.'],
 ['Moody’s','https://ratings.moodys.com/','bloqué','Accès automatisé interdit par les conditions consultées ; page non exploitable.'],
 ['Fitch Ratings','https://www.fitchratings.com/','manuel uniquement','Copie et redistribution soumises à accord écrit ; aucun accord acquis.'],
 ['Scope Ratings','https://www.scoperatings.com/','bloqué','Page dynamique non exploitable pendant le test.'],
 ['Morningstar DBRS','https://dbrs.morningstar.com/','manuel uniquement','Collecte automatisée soumise à accord écrit préalable ; aucun accord acquis.'],
 ['SEC EDGAR','https://data.sec.gov/','manuel uniquement','API submissions/XBRL documentée, sans CORS ; aucune API de notes validée.']
];
export async function collect(source:string):Promise<never>{throw Error(`Collecte ${source} désactivée : accès et droits non validés. Utilisez un import autorisé.`)}
