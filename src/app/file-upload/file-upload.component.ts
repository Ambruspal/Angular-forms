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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileUploadComponent,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() requiredFileType: string;

  fileName: string = "";
  fileUploadError: boolean = false;
  uploadProgress?: number;

  onChange: Function = (fileName: string) => {};
  onTouched: Function = () => {};
  disabled: boolean = false;

  constructor(private http: HttpClient) {}

  onClick(fileUpload: HTMLInputElement) {
    this.onTouched();
    fileUpload.click();
  }

  onFileSelected(event): void {
    const file: File = event.target.files[0];
    const formData = new FormData();

    this.fileName = file.name;
    this.fileUploadError = false;

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
        }),
        finalize(() => (this.uploadProgress = null))
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress)
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));

        if (event.type === HttpEventType.Response) this.onChange(this.fileName);
      });
  }

  writeValue(value: any): void {
    this.fileName = value;
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
