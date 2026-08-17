import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  collapsed = signal(window.innerWidth < 768);

  constructor() {
    window.addEventListener('resize', () => {
      // Solo forzamos el estado automático al cruzar el breakpoint,
      // no interferimos si el usuario lo togglea manualmente en desktop.
      const isMobile = window.innerWidth < 768;
      if (isMobile !== this._lastIsMobile) {
        this.collapsed.set(isMobile);
        this._lastIsMobile = isMobile;
      }
    });
  }

  private _lastIsMobile = window.innerWidth < 768;

  toggle(): void {
    this.collapsed.update(v => !v);
  }

  close(): void {
    this.collapsed.set(true);
  }
}