import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('fileUpload', {static: false})
  fileUpload: ElementRef;
  files = [];
  file: any;
  columnDefs;
  rowData = [];
  constructor(private uploadService: UploadService) { }

  ngOnInit(): void {
    this.initGrid();
  }

  initGrid() {
    this.columnDefs = [
      {headerName: 'First name', field: 'First name', sortable: true, filter: true},
      {headerName: 'Sur name', field: 'Sur name', sortable: true, filter: true},
      {headerName: 'Issue count', field: 'Issue count', sortable: true, filter: true},
      {headerName: 'Date of birth', field: 'Date of birth', sortable: true, filter: true}
    ];
  }

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      // for (let index = 0; index < fileUpload.files.length; index++) {
      //   const file = fileUpload.files[index];
      //   this.files.push({ data: file, inProgress: false, progress: 0});
      // }
      this.file = fileUpload.files[0];
      // this.uploadFiles();
      this.uploadDocument(this.file);
    };
    fileUpload.click();
  }

  uploadDocument(file) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.rowData = this.csvToJSON(fileReader.result);
    };
    fileReader.readAsText(this.file);
  }

  csvToJSON(csv) {
    const lines = csv.split('\n');
    const result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step
    // (you might convert them to &&& or something, then covert them back later)
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    // return JSON.stringify(result); // JSON
    return result; // JavaScript object
  }

  uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    file.inProgress = true;
    this.uploadService.upload(formData).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        return of(`${file.data.name} upload failed.`);
      })).subscribe((event: any) => {
      if (typeof (event) === 'object') {
        console.log(event.body);
      }
    });
  }
}
