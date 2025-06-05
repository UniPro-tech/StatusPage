import { client } from "@datadog/datadog-api-client";

export type IncidentData = {
  type: "incidents";
  id: string;
  attributes: IncidentAttributes;
  relationships: IncidentRelationships;
};

export type IncidentAttributes = {
  title: string;
  created: string;
  modified: string;
  detected: string;
  resolved: string | null;
  visibility: string;
  severity: string;
  state: string;
  timeToDetect: number;
  timeToRepair: number;
  timeToResolve: number;
  timeToInternalResponse: number;
  customerImpacted: boolean;
  fields: {
    state: FieldDropdown;
    severity: FieldDropdown;
    detection_method: FieldDropdown;
    teams: FieldAutocomplete<string[]>;
    services: FieldAutocomplete<string | null>;
    summary: FieldTextbox<string | null>;
    root_cause: FieldTextbox<string | null>;
  };
  field_analytics: {
    state: {
      active: {
        duration: number;
        spans: TimeSpan[];
      };
      stable: {
        duration: number;
        spans: TimeSpan[];
      };
    };
  };
  created_by: UserReference;
  last_modified_by: UserReference;
  commander: UserReference;
  is_test: boolean;
  incidentTypeUuid: string;
  publicId: number;
  customerImpactScope: string;
  customerImpactStart: string | null;
  customerImpactEnd: string | null;
  customerImpactDuration: number;
};

type FieldDropdown = {
  type: "dropdown";
  value: string;
};

type FieldAutocomplete<T> = {
  type: "autocomplete";
  value: T;
};

type FieldTextbox<T> = {
  type: "textbox";
  value: T;
};

type TimeSpan = {
  start: number;
  end: number | null;
};

type UserReference = {
  data: {
    type: "users";
    id: string;
    attributes?: {
      uuid: string;
      handle: string;
      email: string;
      name: string;
      icon: string;
    };
  };
};

type IncidentRelationships = {
  createdByUser: { data: UserReference["data"] };
  lastModifiedByUser: { data: UserReference["data"] };
  commanderUser: { data: UserReference["data"] };
  responders: {
    data: {
      type: "incident_responders";
      id: string;
    }[];
  };
  attachments: { data: unknown[] };
  integrations: { data: unknown[] };
  impacts: { data: unknown[] };
  userDefinedFields: { data: unknown[] };
};

type IncidentField = {
  type: "dropdown" | "autocomplete" | "textbox";
  value: string | string[] | null;
};

export type IncidentFields = {
  state?: IncidentField;
  teams?: IncidentField;
  summary?: IncidentField;
  detection_method?: IncidentField;
  services?: IncidentField;
  severity?: IncidentField;
  root_cause?: IncidentField;
  [key: string]: IncidentField | undefined; // 他に追加されるかもだから柔軟にしとくネ
};

type IncidentRelationship = {
  data: Array<{
    id: string;
    type: string;
  }>;
};

type IncidentItemRelationships = {
  [key: string]: IncidentRelationship;
};

export type IncidentItem = {
  id: string;
  title: string;
  created: Date;
  modified: Date;
  state: string;
  severity: string;
  timeToDetect: number;
  timeToRepair: number;
  timeToResolve: number;
  timeToInternalResponse: number;
  customerImpact: {
    customerImpacted: boolean;
    customerImpactScope: string;
    customerImpactStart: Date | null;
    customerImpactEnd: Date | null;
    customerImpactDuration: number;
  };
  fields: IncidentFields;
  relationships: IncidentItemRelationships;
  incidentId: string;
  incidentUrl: string;
  createdAt: Date;
  modifiedAt: Date;
  resolvedAt: Date | null;
  visibility: string;
};

export const datadogClientConfiguration = client
  .createConfiguration({
    authMethods: {
      apiKeyAuth: process.env.DATADOG_API_KEY || "",
      appKeyAuth: process.env.DATADOG_APP_KEY || "",
    },
  })
  .setServerVariables({
    site: process.env.DATADOG_API_SITE || "datadoghq.com",
  });
