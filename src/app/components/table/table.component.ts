import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort, MatSortable} from '@angular/material/sort';
import {Post} from '../../models/post';
import {SelectionModel} from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import {DialogComponent} from '../dialog/dialog.component';
import { ToastrService } from 'ngx-toastr';
import {FormGroup, FormControl, Validators, AbstractControl, FormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';

const auxPost: Post[] = [
  {userId: 1, id: 1, title: 'hello 0', body: 'test 0'},
  {userId: 1, id: 2, title: 'hello 1', body: 'test 1'},
  {userId: 1, id: 3, title: 'hello 2', body: 'test 2'},
];

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnDestroy  {
  subscription: Subscription = new Subscription();
  dataSource !: MatTableDataSource<Post>;
  displayedColumns: string[] = ['select', 'userId', 'id', 'title', 'body'];
  selection = new SelectionModel<Post>(false, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  addForm: boolean; /** if is the form show or hide */
  isEdit: boolean; /** if option selected wos edit */
  isDisconnectNetwork: boolean;  /** if there is a connection, I charge the data remotely else charge data local. */
  postForm: FormGroup = this.formBuilder.group( {
    title: ['', { validators: [Validators.required, Validators.minLength(5)], updateOn: 'change' }],
    body: ['', { validators: [Validators.required, Validators.minLength(10)], updateOn: 'change' }],
  });
  constructor(
    private postService: PostService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private formBuilder: FormBuilder) {
    this.addForm = false;
    this.isEdit = false;
    this.isDisconnectNetwork = false;
  }

  ngOnInit(): void {
    this.postService.get().subscribe(posts => {
        this.dataSource = new MatTableDataSource<Post>(posts);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isDisconnectNetwork = false;
      },
    error => {
      this.dataSource = new MatTableDataSource<Post>(auxPost);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.isDisconnectNetwork = true;
      this.showErrorAlert(error.message);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  addRow(): void {
    this.isEdit = false;
    this.postForm.reset();
    this.selection.clear();
    this.addForm = true;
  }

  deleteRow(): void {
    if (!this.selection.isEmpty()){
        const dialogRef = this.dialog.open(DialogComponent,  {
          data: 'Are your sure to delete post?'
        });
        dialogRef.afterClosed().subscribe(resp => {
          if (resp){
            if (this.isDisconnectNetwork){
              const index = this.dataSource.data.indexOf(this.selection.selected[0]);
              this.dataSource.data.splice(index, 1);
              this.dataSource._updateChangeSubscription();
              this.selection.clear();
              this.showSuccessAlert('Post has been delete');
            } else {
              this.deletePostJsonPlaceholder(this.selection.selected[0]);
            }
          }
        });
    } else {
      this.showWarningAlert('Please select a post for delete');
    }
  }

  updateRow(): void {
    if (!this.selection.isEmpty()){
        const row = this.selection.selected[0];
        this.postForm.patchValue({
          title: row.title,
          body: row.body
        });
        this.isEdit = true;
        this.addForm = true;
    } else {
     this.showWarningAlert('Please select a post for update');
    }
  }

  closeForm(): void {
    this.isEdit = false;
    this.addForm = false;
    this.postForm.reset();
    this.selection.clear();
  }

  onSubmit(): void {
    const row = this.postForm.value;
    let msg = '';
    if (this.isEdit){
      let post = this.selection.selected[0];
      const newPost = {userId: post.userId, id: post.id, title: row.title, body: row.title};
      if (this.isDisconnectNetwork){
        msg = 'the post has been updated';
        this.dataSource.data[this.dataSource.data.indexOf(post)]  = newPost;
        this.dataSource._updateChangeSubscription();
        this.showSuccessAlert('the post has been updated');
        this.closeForm();
      } else {
        this.updatePostJsonPlaceholder(newPost);
      }
    } else {
      const length = (this.dataSource.data.length + 1);
      const newPost = {userId: 1, id: length, title: row.title, body: row.title};
      if (this.isDisconnectNetwork){
        this.dataSource.data.push(newPost);
        msg = 'the post has been added';
        this.dataSource._updateChangeSubscription();
        this.showSuccessAlert(msg);
        this.closeForm();
      } else {
        this.sendPostJsonPlaceholder(newPost);
      }
    }
  }

  showWarningAlert(msg: string): void {
    this.toastr.warning(msg, 'Alert!');
  }

  showErrorAlert(msg: string): void {
    this.toastr.error(msg, 'Alert!');
  }

  showSuccessAlert(msg: string): void {
    this.toastr.success(msg, 'Alert!');
  }

  /** if data is remote, i do send post to Api */
  sendPostJsonPlaceholder(post: Post): void {
    this.postService.sendPost(post).subscribe(post => {
        this.dataSource.data.push(post);
        this.dataSource._updateChangeSubscription();
        this.showSuccessAlert('the post has been added');
        this.closeForm();
      });
  }

  /** if data is remote, i do send put to Api */
  updatePostJsonPlaceholder(post: Post): void {
    this.postService.updatePost(post).subscribe(obj => {
      this.dataSource.data[this.dataSource.data.indexOf(post)]  = obj;
      this.dataSource._updateChangeSubscription();
      this.showSuccessAlert('the post has been updated');
      this.closeForm();
    });
  }

  /** if data is remote, i do send put to Api */
  deletePostJsonPlaceholder(post: Post): void {
    this.postService.deletePost(post.id).subscribe(obj => {
      const index = this.dataSource.data.indexOf(post);
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
      this.showSuccessAlert('Post has been delete');
    });
  }
}
