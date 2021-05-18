import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Post} from '../models/post';

const baseURL = 'https://jsonplaceholder.typicode.com/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<any> {
    return this.httpClient.get(baseURL);
  }
  getById(id: number): Observable<any> {
    return this.httpClient.get(baseURL + '/' + id);
  }
  sendPost(post: Post): Observable<any> {
    return this.httpClient.post(baseURL, post);
  }
  updatePost(post: Post): Observable<any> {
    return this.httpClient.put(baseURL + post.id, post);
  }
  deletePost(id: number): Observable<{}> {
    return this.httpClient.delete(baseURL + id);
  }
}
