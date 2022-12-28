import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { elements } from 'src/assets/elements';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users = elements;
    return { users };
  }

  // Overrides the genId method to ensure that a hero always has an id.
  // If the heroes array is empty,
  // the method below returns the initial number (11).
  // if the heroes array is not empty, the method below returns the highest
  // hero id + 1.
  // genId(heroes: Hero[]): number {
  // return heroes.length > 0 ? Math.max(...heroes.map(hero => hero.id)) + 1 : 11;
  // }
}
