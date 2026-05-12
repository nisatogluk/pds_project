import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOccurrences } from './my-occurrences';

describe('MyOccurrences', () => {
  let component: MyOccurrences;
  let fixture: ComponentFixture<MyOccurrences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOccurrences],
    }).compileComponents();

    fixture = TestBed.createComponent(MyOccurrences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
