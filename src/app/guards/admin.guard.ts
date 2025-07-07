import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { SupabaseService } from "../services/supabase.service"

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (this.supabaseService.isAdmin()) {
      return true
    } else {
      this.router.navigate(["/"])
      return false
    }
  }
}
