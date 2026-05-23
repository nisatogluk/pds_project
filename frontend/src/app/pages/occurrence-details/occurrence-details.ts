import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-occurrence-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

  ngOnInit(): void {
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
    if (!id) return;

    this.loadOccurrenceDetails(id);
  }
// Details loading and normalization function (Called both at first startup and after comment)
  private loadOccurrenceDetails(id: string) {
    this.dataService.getOccurrenceById(id).subscribe({
      next: (data: any) => {
        this.occurrence = data || {};

        if (!this.occurrence.comments) {
          this.occurrence.comments = [];
        }

        // Normalize comments to ensure fields always exist
        this.occurrence.comments = (this.occurrence.comments || []).map((c: any) => ({
          text: c?.text || c?.body || '',
          userId: c?.userId || c?.user_id || c?.authorId || c?.user?._id || 'unknown',
          userName: c?.userName || c?.username || c?.name || c?.user?.username || null,
          createdAt: c?.createdAt || c?.created_at || new Date().toISOString()
        }));

        // Ensure occurrence has userId (owner) normalized
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
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '---';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return '---';
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Comment label logic:
  // - If comment.userId === occurrence.userId -> OWNER
  // - Else -> User #shortId
  getCommentLabel(comment: any): string {
    const userId = comment?.userId || 'unknown';
    const userName = comment?.userName || 'User';

    // OWNER (post/report ) - OWNER should be shown regardless of viewer
    if (this.occurrence?.userId && userId === this.occurrence.userId) {
      const ownerLabel = userName && userName !== 'You' ? userName : `User #${this.shortId(userId)}`;
      return `Owner (${ownerLabel})`;
    }

    // YOU (current logged user)
    if (userId && userId === this.currentUserId) {
      return `${userName} (You)`;
    }

    // Other users
    return `User #${this.shortId(userId)}`;
  }

  private shortId(id: string): string {
    if (!id) return 'unknown';
    return id.length > 5 ? id.slice(0, 5) : id;
  }

  // POST COMMENT
  postComment() {
    // 1. Secury
    if (!this.isAuthenticated()) {
      console.warn('You need to log in to make comment.');
      return;
    }

    // 2. EMPTY COMMENT CONTROL
    if (!this.newComment || !this.newComment.trim()) return;

    const text = this.newComment.trim();
    const occurrenceId = this.occurrence._id;

    this.dataService.addComment(occurrenceId, text)
      .subscribe({
        next: (res: any) => {
          this.newComment = ''; 
        
          // EXACT SOLUTION: After adding the comment, we re-retrieve the data from the backend in the background.
          // Thus, all IDs and the Owner label are in place with zero errors, as if the page was refreshed.
          this.loadOccurrenceDetails(occurrenceId);
        },
        error: (err) => {
          console.error('Comment error:', err);
        }
      });
  }
}