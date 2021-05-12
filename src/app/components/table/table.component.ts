import {  Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit  {

  posts: any;
  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.readAll().subscribe(
      posts => {
        this.posts = posts;
        console.log(posts);
      },
      error => {
        alert(error);
      });
  }
}



