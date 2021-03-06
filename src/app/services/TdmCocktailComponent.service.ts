import { Injectable, Inject, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TdmCocktailComponent } from '../model/cocktail/TdmCocktailComponent';

@Injectable()
export class TdmCocktailComponentService {
  private _availableComponents: BehaviorSubject<TdmCocktailComponent[]> = new BehaviorSubject([])
  public readonly availableComponents: Observable<TdmCocktailComponent[]> = this._availableComponents.asObservable()

  private _recommendedComponents: BehaviorSubject<TdmCocktailComponent[]> = new BehaviorSubject([])
  public readonly recommendedComponents: Observable<TdmCocktailComponent[]> = this._recommendedComponents.asObservable()

  private _installedComponents: BehaviorSubject<TdmCocktailComponent[]> = new BehaviorSubject([])
  public readonly installedComponents: Observable<TdmCocktailComponent[]> = this._installedComponents.asObservable()

  private sourceUrl?: string
  private recommendedComponentIds: string[] = []
  private installedComponentIds: string[] = []

  constructor(
    private http: HttpClient,
    @Inject('componentSourceUrl') @Optional() public componentSourceUrl?: string) {
    this.sourceUrl = componentSourceUrl
    this.updateComponents()
  }

  setComponentSourceUrl(url: string) {
    this.sourceUrl = url
    this.updateComponents()
  }

  setComponents(components: TdmCocktailComponent[]) {
    this._availableComponents.next(components)
    this.updateRecommendedComponents()
  }

  setRecommendComponentIds(componentIds: string[]) {
    this.recommendedComponentIds = componentIds
    this.updateRecommendedComponents()
  }

  setInstalledComponentIds(componentIds: string[]) {
    this.installedComponentIds = componentIds
    this.updateInstalledComponents()
  }

  updateComponents() {
    if (this.sourceUrl != null) {
      this.http.get<TdmCocktailComponent[]>(this.sourceUrl).subscribe(components => {
        if (components["available"] != null) {
          var available = components["available"];
          var installed = components["installed"];
          var recommended = components["recommended"];
          this._availableComponents.next(available)
          this.setRecommendComponentIds(recommended)
          this.setInstalledComponentIds(installed)
        } else {
          this._availableComponents.next(components)
        }
        this.updateRecommendedComponents()
      });
    }
  }

  private updateRecommendedComponents() {
    var recommended = []
    if (this.recommendedComponentIds) {
      recommended = this.recommendedComponentIds.map(id => {
        return this._availableComponents.value.find(component => {
          return component.id === id
        })
      })
    }
    this._recommendedComponents.next(recommended)
  }

  private updateInstalledComponents() {
    var installed = []
    if (this.installedComponentIds) {
      installed = this.installedComponentIds.map(id => {
        return this._availableComponents.value.find(component => {
          return component.id === id
        })
      })
    }
    this._installedComponents.next(installed)
  }

}
