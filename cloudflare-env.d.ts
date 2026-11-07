declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    OWNER_USER_ID?: string;
    BUCKET?: R2Bucket;
  }
}
