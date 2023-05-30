import {Component, OnInit} from '@angular/core';
import {UiHelperService} from "../../core/services/ui-helper.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  settingSidebarVisible: boolean;

  constructor(public uiHelperService: UiHelperService) {
    this.settingSidebarVisible = false;
  }

  ngOnInit(): void {
  }

}
