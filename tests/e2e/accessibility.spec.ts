import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const fixture=JSON.parse(fs.readFileSync('examples/fictitious.json','utf8'))[0];
for(const width of [1440,390]){
 test(`WCAG automated checks, empty and populated pages at ${width}px`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:900});
  const results:unknown[]=[];
  async function scan(name:string){
   await expect(page.locator('h1')).toBeVisible();
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
   results.push({name,violations:result.violations,incomplete:result.incomplete,passes:result.passes.length});
   await testInfo.attach(name,{body:JSON.stringify(results.at(-1),null,2),contentType:'application/json'});
   expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
  }
  for(const route of ['dashboard','catalogue','compare','history','favorites','imports','sources','method','settings']){
   await page.goto('/#'+route);await scan('empty-'+route);
  }
  await page.goto('/#imports');await page.locator('#file').setInputFiles('examples/fictitious.json');await scan('import-preview');
  await page.getByLabel('J’ai contrôlé les sources',{exact:false}).check();await page.getByRole('button',{name:'Confirmer l’import',exact:true}).click();await expect(page.getByRole('status')).toContainText('Enregistré');
  for(const route of ['catalogue','history','company/'+fixture.companyId,'compare']){
   await page.goto('/#'+route);
   if(route==='compare')await page.getByLabel(fixture.companyName,{exact:true}).check();
   await scan('populated-'+route.replace('/','-'));
  }
 });
}
test('keyboard bypass and navigation focus',async({page})=>{
 await page.goto('/');await expect(page.locator('h1')).toBeVisible();
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Aller au contenu principal'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
 await page.locator('nav a[href="#catalogue"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('h1')).toHaveText('Catalogue');await expect(page.locator('h1')).toBeFocused();
 await page.getByLabel('Rechercher',{exact:true}).focus();await page.keyboard.type('exemple');await expect(page.getByLabel('Rechercher',{exact:true})).toHaveValue('exemple');
});
