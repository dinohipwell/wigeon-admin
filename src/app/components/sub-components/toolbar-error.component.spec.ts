import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToolbarErrorComponent } from './toolbar-error.component';

xdescribe('CockpitFlyComponent', () => {
  let component: ToolbarErrorComponent;
  let fixture: ComponentFixture<ToolbarErrorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ToolbarErrorComponent]
})
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
