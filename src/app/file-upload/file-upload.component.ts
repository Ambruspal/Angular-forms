import { Component, Input } from "@angular/core";
import { HttpClient, HttpEventType } from "@angular/common/http";
import { catchError, finalize } from "rxjs/operators";
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validator,
} from "@angular/forms";
import { noop, of, throwError } from "rxjs";

@Component({
  selector: "file-upload",
  templateUrl: "file-upload.component.html",
  styleUrls: ["file-upload.component.scss"],
})
export class FileUploadComponent {
  @Input() requiredFileType: string;

  fileName: string = "";

  fileUploadError: boolean = false;

  uploadProgress?: number;

  constructor(private http: HttpClient) {}

  onFileSelected(event): void {
    const file: File = event.target.files[0];

    this.fileName = file.name;

    this.fileUploadError = false;

    const formData = new FormData();

    formData.append("thumbnail", file);

    this.http
      .post("/api/thumbnail-upload", formData, {
        reportProgress: true,
        observe: "events",
      })
      .pipe(
        catchError((error) => {
          this.fileUploadError = true;
          return throwError(() => new Error(error));
        })
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress)
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
      });
  }
}
