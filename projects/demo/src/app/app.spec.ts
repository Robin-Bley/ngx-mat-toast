import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {App} from './app';
import {NgxMatToastService} from 'ngx-mat-toast';

describe('Demo App', () => {
  const toastServiceMock = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(() => ({
      id: 'toast-1',
      dismiss: vi.fn(),
      afterDismissed: () => ({subscribe: vi.fn()}),
    })),
    show: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: NgxMatToastService,
          useValue: toastServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the demo heading', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('ngx-mat-toast');
  });

  it('calls success on the quick success button', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const button = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((candidate) => candidate.textContent?.includes('Quick success')) as HTMLButtonElement;

    button.click();

    expect(toastServiceMock.success).toHaveBeenCalledWith('Changes saved successfully.', 'Saved');
  });

  it('calls show() when a toast type button is clicked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const button = Array.from(
      fixture.nativeElement.querySelectorAll('.toast-btn') as NodeListOf<HTMLButtonElement>,
    )[0] as HTMLButtonElement;
    button.click();

    expect(toastServiceMock.show).toHaveBeenCalled();
  });

  it('calls clear() when clear all is clicked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const button = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((candidate) => candidate.textContent?.includes('Clear all')) as HTMLButtonElement;

    button.click();

    expect(toastServiceMock.clear).toHaveBeenCalledTimes(1);
  });
});
