// Lightweight analytics wrapper around Google gtag
class AnalyticsService {
  isAvailable() {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  track(eventName, params = {}) {
    try {
      if (!this.isAvailable()) return; // silently ignore
      window.gtag('event', eventName, params);
    } catch (_) {
      // no-op
    }
  }

  docGenerationStart(type) {
    this.track('doc_generation_start', { doc_type: type });
  }

  docGenerationSuccess(type, plan) {
    this.track('doc_generation_success', { doc_type: type, plan });
  }

  docGenerationError(type, reason) {
    this.track('doc_generation_error', { doc_type: type, reason });
  }

  limitHit(type, plan) {
    this.track('plan_limit_hit', { doc_type: type, plan });
  }

  draftSaved(type) {
    this.track('draft_saved', { doc_type: type });
  }

  shareLinkGenerated(type) {
    this.track('share_link_generated', { doc_type: type });
  }

  emailClicked(type) {
    this.track('email_clicked', { doc_type: type });
  }

  planUpgradeClick(targetPlan, currentPlan) {
    this.track('plan_upgrade_click', { target_plan: targetPlan, current_plan: currentPlan });
  }

  planUpgradeSuccess(newPlan, previousPlan) {
    this.track('plan_upgrade_success', { new_plan: newPlan, previous_plan: previousPlan });
  }
}

export default new AnalyticsService();