import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from "./app-routing.module";

import {AppComponent} from './app.component';
import {ButtonModule} from "primeng/button";
import {TableModule} from "primeng/table";
import {HomeComponent} from './components/home/home.component';
import {CheckboxModule} from "primeng/checkbox";
import {ColorPickerModule} from "primeng/colorpicker";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SliderModule} from "primeng/slider";
import {ModelSettingComponent} from "./components/home/model-setting/model-setting.component";
import {SidebarModule} from "primeng/sidebar";
import {NgOptimizedImage} from "@angular/common";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ModelSettingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ButtonModule,
    TableModule,
    CheckboxModule,
    ColorPickerModule,
    FormsModule,
    SliderModule,
    SidebarModule,
    NgOptimizedImage
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
