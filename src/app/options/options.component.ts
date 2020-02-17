import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { getAllDocuments, createManifest, addEntry, deleteEntry } from './storage';
import { pages } from './documents';

function makeParams(obj: object): string {
  return Object.keys(obj).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  }).join('&');
}

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  optionsForm = new FormGroup({
    selectOrUpload: new FormControl(''),
    pageOrManuscript: new FormControl(''),
    pageOrManifest: new FormControl(''),
    pageSelect: new FormControl(''),
    manuscriptSelect: new FormControl(''),
    meiUpload: new FormControl(),
    bgUpload: new FormControl(),
    manifestUpload: new FormControl()
  });

  selectOrUpload: string = '';
  pageOrManuscript: string = '';
  pageOrManifest: string = '';

  pages: string[];
  pagesLength: number;

  constructor() { }

  ngOnInit() {
    this.pages = pages;
    this.pagesLength = this.pages.length;
    getAllDocuments().then(response => {
      for (const doc of response['rows']) {
        this.pages.push(doc.key);
      }
    });
    this.optionsForm.controls['selectOrUpload'].valueChanges
      .subscribe(change => { this.selectOrUpload = change; });
    this.optionsForm.controls['pageOrManuscript'].valueChanges
      .subscribe(change => { this.pageOrManuscript = change; });
    this.optionsForm.controls['pageOrManifest'].valueChanges
      .subscribe(change => {
          this.pageOrManifest = change;
          this.optionsForm.controls.meiUpload.reset();
          this.optionsForm.controls.bgUpload.reset();
          this.optionsForm.controls.manifestUpload.reset();
      });
  }

  handleSubmit() {
    const controls = this.optionsForm.controls;
    if (controls.selectOrUpload.value === 'select') {
      if (controls.pageOrManuscript.value === 'page') {
        // Select a page
        let params;
        if (this.pages.indexOf(controls.pageSelect.value) >= this.pagesLength) {
          params = makeParams({ storage: controls.pageSelect.value });
        }
        else {
          params = makeParams({ manifest: controls.pageSelect.value });
        }
        window.location.href = './editor.html?' + params;
      }
      else if (controls.pageOrManuscript.value === 'manuscript') {
        let params = makeParams({ manifest: controls.manuscriptSelect.value });
        window.location.href = './editor.html?' + params;
      }
    }
    else if (controls.selectOrUpload.value === 'upload') {
      if (controls.pageOrManifest.value === 'page') {
        let mei: File = (document.getElementById('meiUpload') as HTMLInputElement).files[0];
        let bg: File = (document.getElementById('bgUpload') as HTMLInputElement).files[0];
        createManifest(mei, bg).then(manifest => {
          const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {type: 'application/ld+json'});
          return addEntry(mei.name, manifestBlob);
        }).then(() => {
          window.location.reload();
          // TODO do something else here
        }).catch(err => {
          console.error(err);
        });
      }
      else if (controls.pageOrManifest.value === 'manifest') {
        let manifest = (document.getElementById('manifestUpload') as HTMLInputElement).files[0];
        addEntry(manifest.name, manifest).then(_ => {
          window.location.reload();
        }).catch(err => {
          console.error(err);
        });
      }
    }
  }

}
