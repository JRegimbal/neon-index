import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  selectOrUpload: string = '';
  pageOrManuscript: string = '';
  pageOrManifest: string = '';
  pageSelect: string = '';

  formGroup1 = new FormGroup({
    selectOrUpload: new FormControl(this.selectOrUpload,
      Validators.required)
  });

  formGroup2 = new FormGroup({
    pageOrManuscript: new FormControl(this.pageOrManuscript,
      Validators.required)
  });

  formGroup3_1 = new FormGroup({
    pageSelect: new FormControl(this.pageSelect,
      Validators.required)
  });

  formGroup3_2 = new FormGroup({
    manuscriptSelect: new FormControl('',
      Validators.required)
  });

  formGroup3_3 = new FormGroup({
    meiUpload: new FormControl('',
      Validators.required),
    bgUpload: new FormControl('',
      Validators.required)
  });

  formGroup3_4 = new FormGroup({
    manifestUpload: new FormControl('',
      Validators.required)
  });

  pagesOrig: string[];
  pages: string[];
  pagesLength: number;

  constructor() { }

  ngOnInit() {
    this.pagesOrig = pages;
    this.pages = pages;
    this.pagesLength = this.pages.length;
    getAllDocuments().then(response => {
      for (const doc of response['rows']) {
        this.pages.push(doc.key);
      }
    });
  }

  handleSubmit(e) {
    console.debug("Submit");
    console.debug(e);
    let params;
    switch (e) {
      case "formGroup3_1":
        let value = this.formGroup3_1.controls.pageSelect.value;
        if (this.pagesOrig.includes(value)) {
          params = makeParams({ storage: value });
        }
        else {
          params = makeParams({ manifest: value });
        }
        window.location.href = "./editor.html?" + params;
        break;
      case "formGroup3_2":
        params = makeParams({
          manifest: this.formGroup3_2.controls.manuscriptSelect.value
        });
        window.location.href = "./editor.html?" + params;
        break;
      case "formGroup3_3":
        let mei: File = (document.getElementById("meiUpload") as HTMLInputElement).files[0];
        let bg: File = (document.getElementById("bgUpload") as HTMLInputElement).files[0];
        createManifest(mei, bg).then(manifest => {
          const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/ld+json' });
          return addEntry(mei.name, manifestBlob);
        }).then(_ => {
          window.location.reload();
        }).catch(err => {
          console.error(err);
        });
        break;
      case "formGroup3_4":
        let manifest: File = (document.getElementById("manifestUpload") as HTMLInputElement).files[0];
        addEntry(manifest.name, manifest).then(_ => {
          window.location.reload();
        }).catch(err => {
          console.error(err);
        });
        break;
      default:
        console.error("Unexpected ID: " + e);
        break;
    }
  }

}
