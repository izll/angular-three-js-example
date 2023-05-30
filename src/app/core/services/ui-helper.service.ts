import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class UiHelperService {

  mobileView: boolean;

  constructor() {
    this.mobileView = false;
    this.checkMobileView();
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      this.checkMobileView();
    });
  }

  checkMobileView() {
    this.mobileView = window.innerWidth < 997;
  }

}
