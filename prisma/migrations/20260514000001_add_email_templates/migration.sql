ALTER TABLE "OrgSettings"
  ADD COLUMN IF NOT EXISTS "templateAppSubject"      TEXT NOT NULL DEFAULT 'Application received — {jobTitle}',
  ADD COLUMN IF NOT EXISTS "templateAppBody"         TEXT NOT NULL DEFAULT 'Thank you for applying for the {jobTitle} position at Lobah Games. We have received your application and will review it shortly.

We will be in touch if your profile matches our requirements.',
  ADD COLUMN IF NOT EXISTS "templateHiredSubject"    TEXT NOT NULL DEFAULT 'Congratulations! Offer for {jobTitle}',
  ADD COLUMN IF NOT EXISTS "templateHiredBody"       TEXT NOT NULL DEFAULT 'We are thrilled to inform you that you have been selected for this position. Our team will reach out to you shortly with the next steps.',
  ADD COLUMN IF NOT EXISTS "templateRejectedSubject" TEXT NOT NULL DEFAULT 'Update on your application — {jobTitle}',
  ADD COLUMN IF NOT EXISTS "templateRejectedBody"    TEXT NOT NULL DEFAULT 'After careful consideration, we have decided to move forward with other candidates for this role. We appreciate your interest in Lobah Games and encourage you to apply for future positions.';
