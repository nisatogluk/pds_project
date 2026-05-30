import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { OccurrenceService } from '../../services/occurrence.service';

@Component({
  selector: 'app-occurrence-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './occurrence-details.html',
  styleUrls: ['./occurrence-details.css']
})
export class OccurrenceDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private cdr = inject(ChangeDetectorRef);

  occurrence: any = null;
  loading = true;

  newComment = '';

  currentUserId = '';
  currentUserName = '';

  isLoggedIn = false;

  ngOnInit(): void {

    // AUTH CHECK
    this.isLoggedIn = !!localStorage.getItem('token');

    // USER INFO
    this.currentUserId =
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      localStorage.getItem('_id') ||
      '';

    this.currentUserName =
      localStorage.getItem('username') ||
      localStorage.getItem('name') ||
      'You';

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading = false;
      return;
    }

    this.loadOccurrenceDetails(id);
  }

  // LOAD DETAILS
  private loadOccurrenceDetails(id: string): void {

    this.dataService.getOccurrenceById(id).subscribe({

      next: (data: any) => {

        this.occurrence = data || {};

        // COMMENTS ARRAY SAFETY
        if (!this.occurrence.comments) {
          this.occurrence.comments = [];
        }

        // COMMENT NORMALIZATION to ensure fields always exist
        this.occurrence.comments = this.occurrence.comments.map((c: any) => ({

          text:
            c?.text ||
            c?.body ||
            '',

          userId:
            c?.userId ||
            c?.user_id ||
            c?.authorId ||
            c?.user?._id ||
            'unknown',

          userName:
            c?.userName ||
            c?.username ||
            c?.name ||
            c?.user?.username ||
            null,

          createdAt:
            c?.createdAt ||
            c?.created_at ||
            new Date().toISOString()

        }));
        // ---  (CONSTRAINTS: OLDEST FIRST) ---

        this.occurrence.comments.sort((a: any, b: any) => {

          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        });

        // OCCURRENCE OWNER NORMALIZATION Ensure occurrence has userId (owner) normalized
        this.occurrence.userId =
          this.occurrence.userId ||
          this.occurrence.user_id ||
          this.occurrence.ownerId ||
          this.occurrence.owner ||
          this.occurrence.user?._id ||
          null;

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error('Occurrence loading error:', err);

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  formatDate(date: string): string {

    if (!date) return '---';

    try {
      return new Date(date).toLocaleDateString();
    }
    catch {
      return '---';
    }
  }

  // COMMENT LABEL
  // - If comment.userId === occurrence.userId -> OWNER
  // - Else -> User #shortId
  getCommentLabel(comment: any): string {

    const userId = comment?.userId || 'unknown';

    // OWNER
    if (
      this.occurrence?.userId &&
      userId === this.occurrence.userId
    ) {
      return `Owner (User #${this.shortId(userId)})`;
    }

    // OTHER USERS
    return `User #${this.shortId(userId)}`;
  }

  private shortId(id: string): string {

    if (!id) return 'unknown';

    return id.length > 5
      ? id.slice(0, 5)
      : id;
  }

  // POST COMMENT
  postComment(): void {

    // SECURITY
    if (!this.isLoggedIn) {

      console.warn('You need to login first to make comment.');

      return;
    }

    // EMPTY COMMENT CONTROL
    if (!this.newComment.trim()) return;

    const occurrenceId = this.occurrence?._id;

    // NULL SAFETY
    if (!occurrenceId) {

      console.error('Occurrence ID not found.');

      return;
    }

    const text = this.newComment.trim();

    this.dataService
      .addComment(occurrenceId, text)
      .subscribe({

        next: () => {

          // CLEAR INPUT
          this.newComment = '';

          // LIVE REFRESH
          this.loadOccurrenceDetails(occurrenceId);
        },

        error: (err) => {

          console.error('Comment error:', err);
        }
      });
  }
  private occurrenceService = inject(OccurrenceService);

getUserVote(): string | null {
    if (!this.occurrence?.votes) return null;
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    if (this.occurrence.votes.upvotes?.some((id: string) => id === userId)) return 'upvote';
    if (this.occurrence.votes.downvotes?.some((id: string) => id === userId)) return 'downvote';
    return null;
}

isOwnOccurrence(): boolean {
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    return String(this.occurrence?.userId) === String(userId);
}

vote(voteType: string): void {
    if (!this.isLoggedIn || this.isOwnOccurrence()) return;
    const id = this.occurrence._id;
    this.occurrenceService.voteOccurrence(id, voteType).subscribe({
        next: (data: any) => {
            this.occurrence = data;
            this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Vote error:', err)
    });
}
}