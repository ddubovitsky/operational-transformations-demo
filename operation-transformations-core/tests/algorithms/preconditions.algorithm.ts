import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Precondition 1', () => {
  it('should immediately perform local operation', () => {
    const site1 = new Site();
    const operation = new Operation();
    site1.addLocalOperation(new Operation());

    assert.deepEqual(site1.history, [operation]);
  });

  it('should immediately perform if context are equally empty', () => {
    const site1 = new Site();
    const site2 = new Site();

    const operation = new Operation();
    const addedOperation = site1.addLocalOperation(new Operation());

    site2.addRemoteOperation(addedOperation);

    assert.deepEqual(site2.history, [operation]);
  });


  it('should immediately perform if context are equivalent and have 1 operation', () => {
    const site1 = new Site();
    const site2 = new Site();

    const addedOperation = site1.addLocalOperation(initialOperation);
    site2.addRemoteOperation(addedOperation);


    const target = new Operation();
    const site1GeneratedOperation = site1.addLocalOperation(new Operation(context));

    site2.addRemoteOperation(site1GeneratedOperation);
    assert.deepEqual(site2.history, [addedOperation, site1GeneratedOperation]);
  });

  it('should include and perform perform if context have independent operations', () => {
    const site1 = new Site();
    const site2 = new Site();

    const operation1 = new Operation();
    const operation2 = new Operation();

    const site1addedOperation = site1.addLocalOperation(operation1);
    const site2AddedOperation = site2.addLocalOperation(operation2);

    site2.addRemoteOperation(site1addedOperation);

    assert.deepEqual(site2.history, [site2AddedOperation, site1addedOperation.include(site2AddedOperation)]);
  });


  it('should exclude, include and perform if context have independent AND transformed operations', () => {
    const site1 = new Site();
    const site2 = new Site();

    const operation1 = new Operation();
    const operation2 = new Operation();

    const site1addedOperation = site1.addLocalOperation(operation1);
    const site1addedOperation2 = site1.addLocalOperation(operation2);

    const site2AddedOperation = site2.addLocalOperation(operation2);

    site2.addRemoteOperation(site1addedOperation);
    site2.addRemoteOperation(site1addedOperation2);

    assert.deepEqual(site2.history, [
      site2AddedOperation,
      site1addedOperation.include(site2AddedOperation),
      site1addedOperation2
        .exclude(site1addedOperation)
        .include(site2AddedOperation, site1addedOperation2)]
    );
  });
});
