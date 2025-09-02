import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { SupabaseService } from "../services/supabase.service"

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private supabase: SupabaseService) {}

  async canActivate(): Promise<boolean> {
  const { data, error } = await this.supabase.getSession()

  if (data?.session) {
    return true
  } else {
    this.router.navigate(["/login"])
    return false
  }
}

}
