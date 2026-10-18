import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const fixture=JSON.parse(fs.readFileSync('examples/fictitious.json','utf8'))[0];
test('parcours import, filtres, fiche, suivi, historique et hors ligne',async({page,context})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Vue d’ensemble',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'↥ Imports',exact:true}).click();
 await page.locator('#file').setInputFiles('examples/fictitious.json');
 await expect(page.getByText('1 acceptée(s) · 0 doublon(s) ignoré(s) · 0 rejetée(s)')).toBeVisible();
 await page.getByLabel('J’ai contrôlé les sources', {exact:false}).check();await page.getByRole('button',{name:'Confirmer l’import',exact:true}).click();
 await page.getByRole('link',{name:'Catalogue',exact:false}).first().click();
 await page.getByLabel('Rechercher', {exact:true}).fill('EXEMPLE');await expect(page.getByRole('link',{name:fixture.companyName,exact:true})).toBeVisible();
 await page.getByLabel('Agence',{exact:true}).selectOption('moodys');await expect(page.getByText('Aucune notation à afficher')).toBeVisible();await page.getByLabel('Agence',{exact:true}).selectOption('scope');
 await page.getByRole('link',{name:fixture.companyName,exact:true}).click();await page.getByRole('button',{name:'Ajouter aux favoris',exact:false}).click();await page.getByRole('button',{name:'Surveiller',exact:true}).click();
 await page.reload();await expect(page.getByRole('button',{name:'Retirer des favoris',exact:false})).toBeVisible();
 await page.goto('/#imports');await page.locator('#file').setInputFiles('examples/fictitious.json');await expect(page.getByText('0 acceptée(s) · 1 doublon(s) ignoré(s) · 0 rejetée(s)')).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload();await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);await page.reload();await expect(page.getByRole('heading',{name:'Imports',exact:true})).toBeVisible();await page.goto('/#favorites');await expect(page.getByRole('link',{name:fixture.companyName,exact:true}).first()).toBeVisible();await expect(page.getByText('Hors ligne',{exact:true})).toBeVisible();
});
test('import partiel, dates inconnues, retraits, sécurité et export',async({page})=>{
 await page.goto('/#imports');
 const rows=[fixture,{...fixture,id:'unknown',publishedAt:null,grade:'A',agencyId:'sp',companyId:'xss',companyName:'<img src=x onerror=alert(1)>'},{...fixture,id:'withdraw',action:'withdrawn',grade:null,publishedAt:'2025-02-01',collectedAt:'2025-02-02T12:00:00Z'},{...fixture,id:'invalid',sourceUrl:''}];
 await page.locator('#file').setInputFiles({name:'partial.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(rows))});
 await expect(page.getByText('3 acceptée(s) · 0 doublon(s) ignoré(s) · 1 rejetée(s)')).toBeVisible();
 await expect(page.locator('main img')).toHaveCount(0);await expect(page.getByRole('button',{name:'Confirmer l’import',exact:true})).toBeDisabled();
 await page.getByLabel('Confirmer un import partiel', {exact:false}).check();await page.getByLabel('J’ai contrôlé les sources',{exact:false}).check();await page.getByRole('button',{name:'Confirmer l’import',exact:true}).click();
 await page.goto('/#catalogue');await expect(page.getByText('Retirée',{exact:true})).toBeVisible();await expect(page.getByText('Date inconnue',{exact:true})).toBeVisible();
 await page.goto('/#history');await expect(page.getByRole('cell',{name:'BBB',exact:true})).toBeVisible();
 await page.goto('/#imports');const wait=page.waitForEvent('download');await page.getByRole('button',{name:'Exporter en JSON'}).click();const d=await wait;expect(d.suggestedFilename()).toBe('ratingor-export.json');
});
test('mobile et sources désactivées',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/#sources');await expect(page.getByRole('heading',{name:'Registre des sources'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByText('Automatisation désactivée', {exact:false}).first()).toBeVisible();});

test('CSV, comparaison entre agences et absence de corruption après refus',async({page})=>{
 await page.goto('/#imports');await page.locator('#file').setInputFiles('examples/fictitious.csv');
 await page.getByLabel('J’ai contrôlé les sources',{exact:false}).check();await page.getByRole('button',{name:'Confirmer l’import',exact:true}).click();
 await expect(page.getByText('Enregistré sur cet appareil.')).toBeVisible();
 await page.locator('#file').setInputFiles({name:'second.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([{...fixture,id:'moodys-event',agencyId:'moodys',grade:'Baa2'}]))});
 await page.getByLabel('J’ai contrôlé les sources',{exact:false}).check();await page.getByRole('button',{name:'Confirmer l’import',exact:true}).click();
 await expect(page.getByText('Enregistré sur cet appareil.')).toBeVisible();
 await page.goto('/#compare');await page.getByLabel(fixture.companyName,{exact:true}).check();
 await expect(page.getByRole('cell',{name:'Scope Ratings',exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'Moody’s',exact:true})).toBeVisible();
 await page.goto('/#imports');await page.locator('#file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.getByRole('status')).toContainText('Import refusé');
 await page.goto('/#catalogue');await expect(page.getByRole('cell',{name:'BBB',exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'Baa2',exact:true})).toBeVisible();
});
