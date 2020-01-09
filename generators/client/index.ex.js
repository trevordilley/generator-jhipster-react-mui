/* eslint-disable consistent-return */
const chalk = require('chalk');

const prompts = require('./prompts');
const ClientGenerator = require('generator-jhipster/generators/client');
const writeReactFiles = require('./files-react').writeFiles;
const constants = require('../generator-constants');
const packagejs = require('../../package.json');

module.exports = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, {fromBlueprint: true, ...opts}); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint react-mui')}`);
        }

        this.configOptions = jhContext.configOptions || {};

        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupClientOptions(this, jhContext);
    }

    get initializing() {
        const phaseFromJHipster = super._initializing();
        const myCustomPhaseSteps = {
            setupClientconsts() {
                // Make constants available in templates
                this.MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
                this.TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
                const configuration = this.getAllJhipsterConfig(this, true);
                this.serverPort = configuration.get('serverPort') || this.configOptions.serverPort || 8080;
                this.applicationType = configuration.get('applicationType') || this.configOptions.applicationType;
                if (!this.applicationType) {
                    this.applicationType = 'monolith';
                }

                this.enableTranslation = configuration.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
                this.nativeLanguage = configuration.get('nativeLanguage');
                this.languages = configuration.get('languages');
                this.enableI18nRTL = this.isI18nRTLSupportNecessary(this.languages);
                this.messageBroker = configuration.get('messageBroker');
                this.packagejs = packagejs;
                const baseName = configuration.get('baseName');
                if (baseName) {
                    this.baseName = baseName;
                }

                this.serviceDiscoveryType =
                    configuration.get('serviceDiscoveryType') === 'no'
                        ? false
                        : configuration.get('serviceDiscoveryType') || this.configOptions.serviceDiscoveryType;
                if (this.serviceDiscoveryType === undefined) {
                    this.serviceDiscoveryType = false;
                }

                const clientConfigFound = this.enableTranslation !== undefined;
                if (clientConfigFound) {
                    // If translation is not defined, it is enabled by default
                    if (this.enableTranslation === undefined) {
                        this.enableTranslation = true;
                    }
                    if (this.nativeLanguage === undefined) {
                        this.nativeLanguage = 'en';
                    }
                    if (this.languages === undefined) {
                        this.languages = ['en', 'fr'];
                    }

                    this.existingProject = true;
                }
                this.useNpm = this.configOptions.useNpm = !this.options.yarn;
                this.useYarn = !this.useNpm;
                if (!this.clientPackageManager) {
                    if (this.useNpm) {
                        this.clientPackageManager = 'npm';
                    } else {
                        this.clientPackageManager = 'yarn';
                    }
                }
            }
        }
        return Object.assign(phaseFromJHipster, myCustomPhaseSteps);
    }

    get prompting() {
        return {
            askForModuleName: prompts.askForModuleName,
            askFori18n: prompts.askFori18n,

            setSharedConfigOptions() {
                this.configOptions.skipClient = this.skipClient;
                this.configOptions.clientFramework = this.clientFramework;
            }
        };
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        // The writing phase is being overriden so that we can write our own templates as well.
        // If the templates doesnt need to be overrriden then just return `super._writing()` here
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            writeAdditionalFile() {
                writeFiles.call(this);
            }
        };
        return Object.assign(phaseFromJHipster, customPhaseSteps);
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
