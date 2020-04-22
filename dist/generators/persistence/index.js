"use strict";

const Generator = require("yeoman-generator");
const convert = require("xml-js");
const plur = require("plur");
const path = require("path");
const fs = require("fs");

module.exports = class extends Generator {
  async prompting() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "projectPath",
        message: "Path to Backend project",
        default: "ORC.Backend"
      },
      {
        type: "input",
        name: "modelName",
        message: "The name of the desired model",
      },
      {
        type: "input",
        name: "modelNamespace",
        message: "The model's namespace",
        store: true
      },
    ]);

    const projPath = path.join(this.destinationPath(), answers.projectPath);
    this.projFileName = fs.readdirSync(projPath).find(x => x.match(/.*\.csproj$/ig));

    if (!this.projFileName) {
      this.log("project file was not found!");
      process.exit(1);
    }

    this.destinationRoot(projPath);

    this.modelName = answers.modelName;
    this.modelNamespace = answers.modelNamespace;
    this.modelPlural = plur(this.modelName);
    this.modelClass = `${this.modelName}Persistence`;

    this.interfaceFilePath = `Persistence/I${this.modelClass}.cs`;
    this.databaseFilePath = `Persistence/Database/${this.modelClass}.cs`;
    this.domeDatabaseFilePath = "Persistence/Database/DomeDatabasePersistence.cs";
    this.domeFileFilePath = "Persistence/File/DomeFilePersistence.cs";
    this.domeFilePath = "Persistence/IDomePersistence.cs";
  }

  writing() {
    this._copyTemplates();
    this._updateProject();
    this._updateImports();
  }

  end() {
    console.log("Dome!");
  }

  _copyTemplates() {
    this.fs.copyTpl(
      this.templatePath("IPersistence.cs"),
      this.destinationPath(this.interfaceFilePath),
      {
        modelName: this.modelName,
        modelPlural: this.modelPlural,
        modelNamespace: this.modelNamespace,
      }
    );

    this.fs.copyTpl(
      this.templatePath("DatabasePersistence.cs"),
      this.destinationPath(this.databaseFilePath),
      {
        modelName: this.modelName,
        modelPlural: this.modelPlural,
        modelNamespace: this.modelNamespace,
      }
    );
  }

  _updateImports() {
    this.fs.copy(this.domeFilePath, this.domeFilePath, {
      process: (content) => {
        const newLine = `I${this.modelClass} ${this.modelPlural} { get; }\n\n\t\t/// generator-dome ///`;

        const regEx = new RegExp("/// generator-dome ///", "g");
        const newContent = content.toString().replace(regEx, newLine);
        return newContent;
      },
    });

    this.fs.copy(this.domeDatabaseFilePath, this.domeDatabaseFilePath, {
      process: (content) => {
        let newLine, regEx;

        newLine = `private readonly Lazy<I${this.modelClass}> m_${this.modelClass};\n\t\t/// generator-dome:lazy ///`;
        regEx = new RegExp("/// generator-dome:lazy ///", "g");
        content = content.toString().replace(regEx, newLine);

        newLine = `m_${this.modelClass} = new Lazy<I${this.modelClass}>(() => new ${this.modelClass}(m_Db));\n\t\t/// generator-dome:lazyStart1 ///`;
        regEx = new RegExp("/// generator-dome:lazyStart1 ///", "g");
        content = content.toString().replace(regEx, newLine);

        newLine = `m_${this.modelClass} = new Lazy<I${this.modelClass}>(() => new ${this.modelClass}(m_Db));\n\t\t/// generator-dome:lazyStart2 ///`;
        regEx = new RegExp("/// generator-dome:lazyStart2 ///", "g");
        content = content.toString().replace(regEx, newLine);

        newLine = `public I${this.modelClass} ${this.modelPlural} => m_${this.modelClass}.Value;\n\n\t\t/// generator-dome:property ///`;
        regEx = new RegExp("/// generator-dome:property ///", "g");
        content = content.toString().replace(regEx, newLine);

        return content;
      },
    });

    this.fs.copy(this.domeFileFilePath, this.domeFileFilePath, {
      process: (content) => {
        let newLine, regEx;

        newLine = `public I${this.modelClass} ${this.modelPlural} { get; }\n\n\t\t/// generator-dome:property ///`;
        regEx = new RegExp("/// generator-dome:property ///", "g");
        content = content.toString().replace(regEx, newLine);

        return content;
      },
    });
  }

  _updateProject() {
    const xml = fs.readFileSync(this.projFileName, "utf8");
    const projFile = convert.xml2js(xml, {
      compact: true,
      ignoreComment: true,
      spaces: 2
    });

    const compileIndex = projFile.Project.ItemGroup.findIndex(x => {
      const keys = Object.keys(x);
      return keys.length === 1 && keys[0] === "Compile";
    });

    projFile.Project.ItemGroup[compileIndex].Compile.push({
      "_attributes": {
        Include: this._fixPath(this.interfaceFilePath)
      }
    });

    projFile.Project.ItemGroup[compileIndex].Compile.push({
      "_attributes": {
        Include: this._fixPath(this.databaseFilePath)
      }
    });

    projFile.Project.ItemGroup[compileIndex].Compile.sort((a, b) => {
      return a._attributes.Include.localeCompare(b._attributes.Include);
    });

    const newXml = convert.js2xml(projFile, {
      compact: true,
      ignoreComment: true,
      spaces: 2
    });

    this.fs.write(this.projFileName, newXml);
  }

  _fixPath(path) {
    return path.split("/").join("\\");
  }
};
