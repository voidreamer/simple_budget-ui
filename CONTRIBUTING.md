# Contributing to SimpleBudget (Frontend)

## Branching Strategy

```
feature-branch → PR → staging → test → PR → main (production)
```

### Branches
- **`main`** — Production. Protected. Deploys automatically to S3 + CloudFront.
- **`staging`** — Testing. Deploys automatically to staging S3 + CloudFront.
- **Feature branches** — Your working branches. Create from `staging`.

### Workflow
1. Create a feature branch from `staging`: `git checkout staging && git checkout -b feature/my-change`
2. Make your changes, commit, push
3. Open a PR to `staging` — merge when ready
4. Test on the staging environment
5. When validated, open a PR from `staging` → `main`
6. Merge to deploy to production

### Rules
- **Never push directly to `main`** — always use PRs
- **Test on staging first** — don't skip it

### GitHub Secrets Needed for Staging
- `S3_BUCKET_NAME_STAGING` — staging S3 bucket
- `CLOUDFRONT_DISTRIBUTION_ID_STAGING` — staging CloudFront distribution
- `VITE_SUPABASE_URL_STAGING` — staging Supabase URL
- `VITE_SUPABASE_ANON_KEY_STAGING` — staging Supabase anon key
- `VITE_API_BASE_URL_STAGING` — staging API URL
