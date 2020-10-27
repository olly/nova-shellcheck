class IssuesProvider {
  provideIssues(editor) {
    console.info("validating: ", editor.document.path);
    if (!editor.document.path) {
      return;
    }

    let process = new Promise((resolve, _) => {
      var process = new Process("shellcheck", {
        shell: true,
        args: ["--format", "json", editor.document.path],
      });

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
    });

    return process.then(function (stdout) {
      return JSON.parse(stdout).map(function (data, i) {
        console.info(i, data.message);

        let issue = new Issue();

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

var registration = undefined;

exports.activate = function () {
  registration = nova.assistants.registerIssueAssistant(
    { syntax: "shell" },
    new IssuesProvider()
  );
};

exports.deactivate = function () {
  if (registration) {
    registration.dispose();
    registration = undefined;
  }
};
