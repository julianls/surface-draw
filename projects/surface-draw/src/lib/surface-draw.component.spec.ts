import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurfaceDrawComponent } from './surface-draw.component';

describe('SurfaceDrawComponent', () => {
  let component: SurfaceDrawComponent;
  let fixture: ComponentFixture<SurfaceDrawComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurfaceDrawComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurfaceDrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
