import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent  {

  constructor(public dialog: MatDialog) { }

  openDialog(): void {
    this.dialog.open(DialogComponent);
  }
 }
