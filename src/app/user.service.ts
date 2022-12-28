import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUser } from './user-list.component';
import {
  map,
  merge,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

@Injectable()
export class UserService {
  addUserAction$$ = new Subject<IUser>();
  deleteUserAction$$ = new Subject<IUser>();
  updateUserAction$$ = new Subject<IUser>();

  private userAdded$ = this.addUserAction$$.pipe(
    switchMap((userToBeAdded) => this.addUser(userToBeAdded)),
    map((user) => (users: IUser[]) => users.concat(user))
  );

  private userUpdated$ = this.updateUserAction$$.pipe(
    switchMap((userToBeUpdated) => this.updateUser(userToBeUpdated)),
    map((user) => (users: IUser[]) => {
      return users.map((u) => {
        if (u.id === user.id) {
          return user;
        }
        return u;
      });
    })
  );

  private userDeleted$ = this.deleteUserAction$$.pipe(
    switchMap((userToBeDeleted) => this.deleteUser(userToBeDeleted)),
    map((user) => (users: IUser[]) => users.filter((u) => u.id !== user.id))
  );

  private fetchedUsers$ = this.http
    .get<IUser[]>('api/users')
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private actions$ = merge(this.userAdded$, this.userUpdated$, this.userDeleted$);

  users$ = this.actions$.pipe(
    startWith(null),
    switchMap(() => this.fetchedUsers$)
  );

  latestUsers$ = this.fetchedUsers$.pipe(
    switchMap((users) =>
      this.actions$.pipe(
        startWith((latest) => latest),
        scan((latestUsers, fn) => fn(latestUsers), users)
      )
    )
  );

  constructor(private http: HttpClient) {}

  private addUser(user: IUser) {
    return this.http.post<IUser>('api/users', user).pipe(map(() => user));
  }

  private deleteUser(user: IUser) {
    return this.http
      .delete<IUser>(`api/users/${user.id}`)
      .pipe(map(() => user));
  }

  private updateUser(updatedUser: IUser) {
    return this.http
      .put<IUser>(`api/users/${updatedUser.id}`, updatedUser)
      .pipe(map(() => updatedUser));
  }
}
