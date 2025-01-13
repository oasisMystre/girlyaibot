import { join } from "path";
import type { AxiosInstance } from "axios";

import { format } from "./utils";

export abstract class ApiImpl {
  protected abstract path: string;

  constructor(protected readonly axios: AxiosInstance) {}

  protected buildPath(...path: (string | number)[]) {
    return join(
      this.path,
      path.map(String).reduce((a, b) => join(a, b)),
    );
  }

  protected buildPathWithQueryString(
    path: string,
    query?: Record<string, any>,
  ) {
    const q = new URLSearchParams(query);
    return format("%?%", path, q.toString());
  }
}
