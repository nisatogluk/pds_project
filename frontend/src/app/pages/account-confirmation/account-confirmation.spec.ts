import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountConfirmation } from './account-confirmation';

describe('AccountConfirmation', () => {
  let component: AccountConfirmation;
  let fixture: ComponentFixture<AccountConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
