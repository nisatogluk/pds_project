import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusUpdateModal } from './status-update-modal';

describe('StatusUpdateModal', () => {
  let component: StatusUpdateModal;
  let fixture: ComponentFixture<StatusUpdateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusUpdateModal],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusUpdateModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
