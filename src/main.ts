interface NovaWritableStream<T = any> {
  getWriter(): WritableStreamDefaultWriter<T>;
}

interface WritableStreamDefaultWriter<W = any> {
  readonly closed: Promise<undefined>;
  readonly desiredSize: number | null;
  readonly ready: Promise<undefined>;
  abort(reason?: any): Promise<void>;
  close(): Promise<void>;
  releaseLock(): void;
  write(chunk?: W): Promise<void>;
}

class IssuesProvider {
  provideIssues(editor: TextEditor): AssistantArray<Issue> {
    console.info("validating: ", editor.document.uri);

    const documentLength = editor.document.length;
    const content = editor.document.getTextInRange(
      new Range(0, documentLength),
    );

    const process: Promise<string> = new Promise((resolve) => {
      type ProcessOptions = { args?: string[]; cwd?: string; shell: true };

      const options: ProcessOptions = {
        shell: true,
        args: ["--format", "json", "-"],
      };

      if (nova.workspace.path) {
        options["cwd"] = nova.workspace.path;
      }

      const process = new Process("shellcheck", options);

      let buffer = "";
      process.onStdout(function (line) {
        buffer = buffer + line;
      });

      process.onStderr(function (line) {
        console.warn(line);
      });

      process.onDidExit(function () {
        resolve(buffer);
      });

      process.start();

      const stdin = process.stdin as NovaWritableStream;
      if (stdin) {
        const writer = stdin.getWriter();
        writer.write(content);
        writer.close();
      } else {
        console.error("no `stdin` configured");
      }
    });

    return process.then(function (stdout) {
      return JSON.parse(stdout).map(function (data: any, i: number) {
        console.info(i, data.message);

        const issue = new Issue();

        issue.message = data.message;

        switch (data.level) {
          case "error":
            issue.severity = IssueSeverity.Error;
            break;
          case "warning":
            issue.severity = IssueSeverity.Warning;
            break;
          case "info":
            issue.severity = IssueSeverity.Info;
            break;
          case "style":
            issue.severity = IssueSeverity.Hint;
            break;
        }

        issue.line = data.line;
        issue.endLine = data.endLine;
        issue.column = data.column;
        issue.endColumn = data.endColumn;
        issue.column = 0;

        return issue;
      });
    });
  }
}

let registration: Disposable | null = null;

exports.activate = function () {
  registration = nova.assistants.registerIssueAssistant(
    { syntax: "shell" },
    new IssuesProvider(),
  );
};

exports.deactivate = function () {
  if (registration) {
    registration.dispose();
    registration = null;
  }
};
