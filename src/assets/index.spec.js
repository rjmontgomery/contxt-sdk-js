import times from 'lodash.times';
import omit from 'lodash.omit';
import Assets from './index';
import * as assetsUtils from '../utils/assets';

describe('Assets', function() {
  let baseRequest;
  let baseSdk;
  let expectedHost;

  beforeEach(function() {
    this.sandbox = sandbox.create();

    baseRequest = {
      delete: this.sandbox.stub().resolves(),
      get: this.sandbox.stub().resolves(),
      post: this.sandbox.stub().resolves(),
      put: this.sandbox.stub().resolves()
    };
    baseSdk = {
      config: {
        audiences: {
          facilities: fixture.build('audience')
        }
      }
    };
    expectedHost = faker.internet.url();
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  describe('constructor', function() {
    let assets;

    beforeEach(function() {
      assets = new Assets(baseSdk, baseRequest);
    });

    it('sets a base url for the class instance', function() {
      expect(assets._baseUrl).to.equal(
        `${baseSdk.config.audiences.facilities.host}/v1`
      );
    });

    it('appends the supplied request module to the class instance', function() {
      expect(assets._request).to.deep.equal(baseRequest);
    });

    it('appends the supplied sdk to the class instance', function() {
      expect(assets._sdk).to.deep.equal(baseSdk);
    });
  });

  describe('create', function() {
    context('when all required information is supplied', function() {
      let assetFromServerAfterFormat;
      let assetFromServerBeforeFormat;
      let assetToServerAfterFormat;
      let assetToServerBeforeFormat;
      let formatAssetFromServer;
      let formatAssetToServer;
      let promise;
      let request;

      beforeEach(function() {
        assetFromServerAfterFormat = fixture.build('asset');
        assetFromServerBeforeFormat = fixture.build('asset', null, {
          fromServer: true
        });
        assetToServerAfterFormat = fixture.build('asset', null, {
          fromServer: true
        });
        assetToServerBeforeFormat = fixture.build('asset');

        formatAssetFromServer = this.sandbox
          .stub(assetsUtils, 'formatAssetFromServer')
          .returns(assetFromServerAfterFormat);
        formatAssetToServer = this.sandbox
          .stub(assetsUtils, 'formatAssetToServer')
          .returns(assetToServerAfterFormat);

        request = {
          ...baseRequest,
          post: this.sandbox.stub().resolves(assetFromServerBeforeFormat)
        };

        const assets = new Assets(baseSdk, request);
        assets._baseUrl = expectedHost;

        promise = assets.create(assetToServerBeforeFormat);
      });

      it('formats the submitted asset object to send to the server', function() {
        expect(formatAssetToServer).to.be.deep.calledWith(
          assetToServerBeforeFormat
        );
      });

      it('creates a new asset', function() {
        expect(request.post).to.be.deep.calledWith(
          `${expectedHost}/assets`,
          assetToServerAfterFormat
        );
      });

      it('formats the returned facility object', function() {
        return promise.then(() => {
          expect(formatAssetFromServer).to.be.deep.calledWith(
            assetFromServerBeforeFormat
          );
        });
      });

      it('returns a fulfilled promise with the new asset information', function() {
        return expect(promise).to.be.fulfilled.and.to.eventually.deep.equal(
          assetFromServerAfterFormat
        );
      });
    });

    context('when there is missing required information', function() {
      ['assetTypeId', 'label', 'organizationId'].forEach((field) => {
        it(`it throws an error when ${field} is missing`, function() {
          const asset = fixture.build('asset');

          const assets = new Assets(baseSdk, baseRequest);
          const promise = assets.create(omit(asset, [field]));

          return expect(promise).to.be.rejectedWith(
            `A ${field} is required to create a new asset.`
          );
        });
      });
    });
  });

  describe('delete', function() {
    context('the asset ID is provided', function() {
      let asset;
      let promise;

      beforeEach(function() {
        asset = fixture.build('asset');

        const assets = new Assets(baseSdk, baseRequest);
        assets._baseUrl = expectedHost;

        promise = assets.delete(asset.id);
      });

      it('requests to delete the asset', function() {
        expect(baseRequest.delete).to.be.calledWith(
          `${expectedHost}/assets/${asset.id}`
        );
      });

      it('returns a resolved promise', function() {
        return expect(promise).to.be.fulfilled;
      });
    });

    context('the asset Id is not provided', function() {
      it('throws an error', function() {
        const assets = new Assets(baseSdk, baseRequest);
        const promise = assets.delete();

        return expect(promise).to.be.rejectedWith(
          'An asset ID is required for deleting an asset.'
        );
      });
    });
  });

  describe('get', function() {
    context('the asset ID is provided', function() {
      let assetFromServerAfterFormat;
      let assetFromServerBeforeFormat;
      let expectedAssetId;
      let formatAssetFromServer;
      let promise;
      let request;

      beforeEach(function() {
        expectedAssetId = faker.random.uuid();
        assetFromServerAfterFormat = fixture.build(
          'asset',
          { id: expectedAssetId },
          {
            fromServer: false
          }
        );
        assetFromServerBeforeFormat = fixture.build(
          'asset',
          { id: expectedAssetId },
          {
            fromServer: true
          }
        );

        formatAssetFromServer = this.sandbox
          .stub(assetsUtils, 'formatAssetFromServer')
          .returns(assetFromServerAfterFormat);

        request = {
          ...baseRequest,
          get: this.sandbox.stub().resolves(assetFromServerBeforeFormat)
        };

        const assets = new Assets(baseSdk, request);
        assets._baseUrl = expectedHost;

        promise = assets.get(expectedAssetId);
      });

      it('gets the asset from the server', function() {
        expect(request.get).to.be.calledWith(
          `${expectedHost}/assets/${expectedAssetId}`
        );
      });

      it('formats the asset object', function() {
        return promise.then(() => {
          expect(formatAssetFromServer).to.be.calledWith(
            assetFromServerBeforeFormat
          );
        });
      });

      it('returns the requested asset', function() {
        return expect(promise).to.be.fulfilled.and.to.eventually.deep.equal(
          assetFromServerAfterFormat
        );
      });
    });

    context('the asset Id is not provided', function() {
      it('throws an error', function() {
        const assets = new Assets(baseSdk, baseRequest);
        const promise = assets.get();

        return expect(promise).to.be.rejectedWith(
          'An asset ID is required for getting information about an asset.'
        );
      });
    });
  });

  describe('getAll', function() {
    let assetsFromServerAfterFormat;
    let assetsFromServerBeforeFormat;
    let formatAssetFromServer;
    let numberOfAssets;
    let promise;
    let request;

    beforeEach(function() {
      numberOfAssets = faker.random.number({ min: 1, max: 10 });
      assetsFromServerAfterFormat = fixture.buildList('asset', numberOfAssets);
      assetsFromServerBeforeFormat = fixture.buildList(
        'asset',
        numberOfAssets,
        null,
        { fromServer: true }
      );

      formatAssetFromServer = this.sandbox
        .stub(assetsUtils, 'formatAssetFromServer')
        .callsFake((asset) => {
          const index = assetsFromServerBeforeFormat.findIndex(
            (assetBeforeFormat) => {
              return assetBeforeFormat.id === asset.id;
            }
          );

          return assetsFromServerAfterFormat[index];
        });

      request = {
        ...baseRequest,
        get: this.sandbox.stub().resolves({
          records: assetsFromServerBeforeFormat,
          _metadata: { offset: 0, totalRecords: numberOfAssets }
        })
      };

      const assets = new Assets(baseSdk, request);
      assets._baseUrl = expectedHost;

      promise = assets.getAll();
    });

    it('gets a list of the assets from the server', function() {
      expect(request.get).to.be.calledWith(`${expectedHost}/assets`);
    });

    it('formats the asset object', function() {
      return promise.then(() => {
        expect(formatAssetFromServer).to.have.callCount(
          assetsFromServerBeforeFormat.length
        );

        assetsFromServerBeforeFormat.forEach((asset) => {
          expect(formatAssetFromServer).to.be.deep.calledWith(asset);
        });
      });
    });

    it('returns a list of assets', function() {
      return expect(promise).to.be.fulfilled.and.to.eventually.deep.equal({
        records: assetsFromServerAfterFormat,
        _metadata: {
          offset: 0,
          totalRecords: numberOfAssets
        }
      });
    });
  });

  describe('getAllByOrganizationId', function() {
    context('the organization ID is provided', function() {
      let assetsFromServerAfterFormat;
      let assetsFromServerBeforeFormat;
      let expectedOptions;
      let expectedOrganizationId;
      let formatAssetFromServer;
      let formatAssetOptionsToServer;
      let initialOptions;
      let numberOfAssets;
      let promise;
      let request;

      beforeEach(function() {
        expectedOrganizationId = fixture.build('organization').id;
        numberOfAssets = faker.random.number({ min: 1, max: 10 });

        assetsFromServerBeforeFormat = fixture.buildList(
          'asset',
          numberOfAssets,
          null,
          { fromServer: true }
        );
        assetsFromServerAfterFormat = fixture.buildList(
          'asset',
          numberOfAssets
        );

        initialOptions = times(faker.random.number({ min: 1, max: 5 })).reduce(
          (memo) => {
            memo[faker.hacker.adjective()] = faker.hacker.adjective();
            return memo;
          },
          {}
        );

        expectedOptions = times(faker.random.number({ min: 1, max: 5 })).reduce(
          (memo) => {
            memo[faker.hacker.adjective()] = faker.hacker.adjective();
            return memo;
          },
          {}
        );

        formatAssetOptionsToServer = this.sandbox
          .stub(assetsUtils, 'formatAssetOptionsToServer')
          .returns(expectedOptions);
        formatAssetFromServer = this.sandbox
          .stub(assetsUtils, 'formatAssetFromServer')
          .callsFake((asset) => {
            const index = assetsFromServerBeforeFormat.findIndex(
              (assetBeforeFormat) => {
                return assetBeforeFormat.id === asset.id;
              }
            );

            return assetsFromServerAfterFormat[index];
          });

        request = {
          ...baseRequest,
          get: this.sandbox.stub().resolves({
            records: assetsFromServerBeforeFormat,
            _metadata: { offset: 0, totalRecords: numberOfAssets }
          })
        };

        const assets = new Assets(baseSdk, request);
        assets._baseUrl = expectedHost;

        promise = assets.getAllByOrganizationId(
          expectedOrganizationId,
          initialOptions
        );
      });

      it('gets options that are in a format suitable for the API', function() {
        expect(formatAssetOptionsToServer).to.be.calledWith(initialOptions);
      });

      it('gets a list of assets for an organization from the server', function() {
        expect(request.get).to.be.deep.calledWith(
          `${expectedHost}/organizations/${expectedOrganizationId}/assets`,
          { params: expectedOptions }
        );
      });

      it('formats the asset object', function() {
        return promise.then(() => {
          expect(formatAssetFromServer).to.have.callCount(
            assetsFromServerBeforeFormat.length
          );

          assetsFromServerBeforeFormat.forEach((asset) => {
            expect(formatAssetFromServer).to.be.deep.calledWith(asset);
          });
        });
      });

      it('returns a list of assets', function() {
        return expect(promise).to.be.fulfilled.and.to.eventually.deep.equal({
          records: assetsFromServerAfterFormat,
          _metadata: {
            offset: 0,
            totalRecords: numberOfAssets
          }
        });
      });
    });

    context('the organization ID is not provided', function() {
      it('throws an error', function() {
        const assets = new Assets(baseSdk, baseRequest);
        const promise = assets.getAllByOrganizationId();

        return expect(promise).to.be.rejectedWith(
          "An organization ID is required for getting a list of an organization's assets."
        );
      });
    });
  });

  describe('update', function() {
    context('when all required information is available', function() {
      let assetFromServerAfterFormat;
      let assetFromServerBeforeFormat;
      let assetToServerAfterFormat;
      let assetToServerBeforeFormat;
      let formatAssetFromServer;
      let formatAssetToServer;
      let request;
      let promise;

      beforeEach(function() {
        assetFromServerAfterFormat = fixture.build('asset');
        assetFromServerBeforeFormat = fixture.build('asset', null, {
          fromServer: true
        });
        assetToServerAfterFormat = fixture.build('asset', null, {
          fromServer: true
        });
        assetToServerBeforeFormat = fixture.build('asset');

        formatAssetFromServer = this.sandbox
          .stub(assetsUtils, 'formatAssetFromServer')
          .returns(assetFromServerAfterFormat);
        formatAssetToServer = this.sandbox
          .stub(assetsUtils, 'formatAssetToServer')
          .returns(assetToServerAfterFormat);

        request = {
          ...baseRequest,
          put: this.sandbox.stub().resolves(assetFromServerBeforeFormat)
        };

        const assets = new Assets(baseSdk, request);
        assets._baseUrl = expectedHost;

        promise = assets.update(
          assetToServerBeforeFormat.id,
          assetToServerBeforeFormat
        );
      });

      it('formats the data into the right format', function() {
        expect(formatAssetToServer).to.be.deep.calledWith(
          assetToServerBeforeFormat
        );
      });

      it('updates the asset', function() {
        expect(request.put).to.be.deep.calledWith(
          `${expectedHost}/assets/${assetToServerBeforeFormat.id}`,
          assetToServerAfterFormat
        );
      });

      it('formats the returned asset', function() {
        return promise.then(() => {
          expect(formatAssetFromServer).to.be.deep.calledWith(
            assetFromServerBeforeFormat
          );
        });
      });

      it('returns a fulfilled promise with the updated asset information', function() {
        return expect(promise).to.be.fulfilled.and.to.eventually.deep.equal(
          assetFromServerAfterFormat
        );
      });
    });

    context(
      'when there is missing or malformed required information',
      function() {
        let assets;

        beforeEach(function() {
          assets = new Assets(baseSdk, baseRequest);
        });

        it('throws an error when there is no provided asset id', function() {
          const assetUpdate = fixture.build('asset');
          const promise = assets.update(null, assetUpdate);

          return expect(promise).to.be.rejectedWith(
            'An asset ID is required to update an asset.'
          );
        });

        it('throws an error when there is no update provided', function() {
          const assetUpdate = fixture.build('asset');
          const promise = assets.update(assetUpdate.id);

          return expect(promise).to.be.rejectedWith(
            'An update is required to update an asset.'
          );
        });

        it('throws an error when the update is not a well-formed object', function() {
          const assetUpdate = fixture.build('asset');
          const promise = assets.update(assetUpdate.id, [assetUpdate]);

          return expect(promise).to.be.rejectedWith(
            'The asset update must be a well-formed object with the data you wish to update.'
          );
        });
      }
    );
  });
});
