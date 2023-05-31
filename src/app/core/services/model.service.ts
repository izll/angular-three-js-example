import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class ModelService {

  constructor(public http: HttpClient) {
  }

  getSampleModels() {
    return this.http.get<Observable<any>>(`assets/models/sample-models.json`);
  }

}
