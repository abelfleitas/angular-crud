import { Component, OnInit, ViewChild } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {Post} from '../../models/post';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit  {

  dataSource!: MatTableDataSource<Post>;
  displayedColumns: string[] = ['select', 'userId', 'id', 'title', 'body'];
  selection = new SelectionModel<Post>(false, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.get().subscribe(posts => {
        this.dataSource = new MatTableDataSource<Post>(posts);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
    error => {
      alert(error.message);
    });
  }

  onRowClicked(row: Post): void {
    this.selection.toggle(row);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Post): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
  addColumn(): void {
    const id = this.dataSource.data.length + 1;
    this.dataSource.data.push(new Post(15, id, 'lorems ispsum', 'djksafkd fsdfdsnfdsjf sfjsnf'));
  }
}
