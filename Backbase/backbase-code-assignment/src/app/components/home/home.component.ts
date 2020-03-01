import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('fileUpload', {static: false})
  fileUpload: ElementRef;
  files = [];
  rowData = [];
  public gridOptionsQueryResults: GridOptions;
  constructor(private uploadService: UploadService) { }

  ngOnInit(): void {
    this.initGrid();
  }

  initGrid() {
    this.gridOptionsQueryResults = {
      enableColResize: true,
      enableSorting: true,
      enableFilter: true,
      rowSelection: 'multiple',
      rowDeselection: true,
      localeText: { noRowsToShow: 'No Data to show' },
      context: { componentParent: this }
    } as GridOptions;
    this.rowData = [];
  }

  private setGridQueryResults(): void {

    const columnDefs: Array<any> = [] as any;
    const cols = this.rowData.length > 0 ? Object.keys(this.rowData[0]) : [];

    cols.forEach((col, i) => {
      const obj: any = { headerName: col, field: col, sortable: true, filter: true };
      columnDefs.push(obj);
    });

    this.gridOptionsQueryResults.api.setColumnDefs(columnDefs);
    this.gridOptionsQueryResults.api.setRowData(this.rowData);

    if (columnDefs.length > 0 && columnDefs.length <= 7) {
      this.gridOptionsQueryResults.api.sizeColumnsToFit();
    }

    if (this.rowData && this.rowData.length > 0) {
      this.gridOptionsQueryResults.api.hideOverlay();
    }
  }

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      this.uploadDocument(file);
    };
    fileUpload.click();
  }

  uploadDocument(file) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.rowData = this.csvToJSON(fileReader.result);
      this.setGridQueryResults();
    };
    fileReader.readAsText(file);
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
}
