const Generator = require("yeoman-generator");
const plur = require("plur");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // This makes `modelName` a required argument.
    // this.argument("modelName", { type: String, required: true });

    // this.modelName = this.options.modelName;
    // this.modelPlural = plur(this.modelName);
    // this.modelClass = `${this.modelName}Persistence`;

    // this.interfaceFilePath = `Persistence/I${this.modelClass}.cs`;
    // this.databaseFilePath = `Persistence/Database/${this.modelClass}.cs`;
    // this.domeDatabaseFilePath = "Persistence/Database/DomeDatabasePersistence.cs";
    // this.domeFilePath = "Persistence/IDomePersistence.cs";
  }

  async prompting() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "modelName",
        message: "The name of the desired model"
      },
      {
        type: "input",
        name: "modelNamespace",
        message: "The model's namespace",
        store: true
      },
    ]);

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

    this.fs.copy(this.domeFilePath, this.domeFilePath, {
      process: (content) => {
        const newLine = `I${this.modelClass} ${this.modelPlural} { get; }\n\n\t\t/// generator-dome ///`;

        var regEx = new RegExp("/// generator-dome ///", "g");
        var newContent = content.toString().replace(regEx, newLine);
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
};
