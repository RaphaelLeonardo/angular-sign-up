import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Option } from "../models/option";
import { ThemeService } from "../services/theme.service";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"]
})
export class MenuComponent {
  @Input() options: Array<Option>;
  @Output() themeChange: EventEmitter<string> = new EventEmitter<string>();
  currentTheme: string;


  constructor(private themeService: ThemeService) {}

  changeTheme(themeToSet) {
    if (themeToSet !== this.currentTheme) {
      this.currentTheme = themeToSet;
      this.themeChange.emit(themeToSet);
    }
  }
}
