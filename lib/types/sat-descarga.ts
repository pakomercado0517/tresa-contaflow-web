export interface SATDownloadStatus {
  profile_id: string;
  last_sync_at: string | null;
  sync_enabled: boolean;
  has_credentials: boolean;
}

export interface RegisterFIELRequest {
  profile_id: string;
  certificate_base64: string;
  private_key_base64: string;
  password: string;
}

export interface RegisterFIELResponse {
  message: string;
  profile_id: string;
}

export interface TriggerSyncResponse {
  profile_id: string;
  synced: number;
  errors: string[];
}
