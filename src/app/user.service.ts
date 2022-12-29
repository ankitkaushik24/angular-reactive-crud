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

  addPredicate(user: IUser) {
    return (users: IUser[]) => users.concat(user);
  }

  updatePredicate = (user: IUser) => (users: IUser[]) => {
    return users.map((u) => {
      if (u.id === user.id) {
        return user;
      }
      return u;
    });
  };

  deletePredicate = (user: IUser) => (users: IUser[]) =>
    users.filter((u) => u.id !== user.id);

  private userAdded$ = this.addUserAction$$.pipe(
    switchMap((userToBeAdded) => this.addUser(userToBeAdded)),
    map((user) => this.addPredicate(user))
  );

  private userUpdated$ = this.updateUserAction$$.pipe(
    switchMap((userToBeUpdated) => this.updateUser(userToBeUpdated)),
    map((user) => this.updatePredicate(user))
  );

  private userDeleted$ = this.deleteUserAction$$.pipe(
    switchMap((userToBeDeleted) => this.deleteUser(userToBeDeleted)),
    map((user) => this.deletePredicate(user))
  );

  private fetchedUsers$ = this.http
    .get<IUser[]>('api/users')
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private userEvent$ = merge(
    this.userAdded$,
    this.userUpdated$,
    this.userDeleted$
  );

  users$ = this.userEvent$.pipe(
    startWith(null),
    switchMap(() => this.fetchedUsers$)
  );

  latestUsers$ = this.fetchedUsers$.pipe(
    switchMap((users) =>
      this.userEvent$.pipe(
        startWith((latest) => latest),
        scan((latestUsers, predicateFn) => predicateFn(latestUsers), users)
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
