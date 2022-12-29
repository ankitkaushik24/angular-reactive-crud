import { DataSource } from "@angular/cdk/collections";
import { Observable } from "rxjs";

export class ReactiveDataSource<T extends any[]> extends DataSource<T> {
  constructor(private dataStream: Observable<T>) {
    super();
  }

  connect(): Observable<T> {
    return this.dataStream;
  }

  disconnect() {}
}