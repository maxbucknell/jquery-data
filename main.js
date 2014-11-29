require.config({
  paths: {
    'sizzle': 'public/lib/jquery/src/sizzle/dist/sizzle',
    'chai': 'public/lib/chai/chai'
  }
})

require([
  'public/lib/jquery/src/jquery',
  'public/lib/lodash/dist/lodash',
  'chai',
  'test-runner'
], function main ($, _, chai, test) {
  'use strict';

  var expect = chai.expect

  /**
   * $.data with plain objects
   */

  /* How to use (and why) */

  test.add('arbitrary data can be stored and retrieved', function () {
    var o = {}

    $.data(o, 'foo', 'bar')

    expect($.data(o, 'foo')).to.equal('bar')
  })

  /* Hidden from JSON.stringify */

  test.add('data is not included when encoded with JSON', function () {
    var o = {}

    $.data(o, 'foo', 'bar')

    expect(JSON.stringify(o)).to.equal('{}')
  })

  /* Attached to the element */

  test.add('data is attached to objects directly', function () {
    var o = {}

    $.data(o, 'foo', 'bar')

    expect(o[$.expando]['data']['foo']).to.equal('bar')
  })

  /**
   * $.data (and $.fn.data) with elements
   */

  /* How to use */

  test.add('data can be stored and retrieved via $.data', function () {
    var $p = $('<p />')
    var p = $p[0]

    $.data(p, 'foo', 'bar')

    expect($.data(p, 'foo')).to.equal('bar')
  })

  test.add('data can be stored and retrieved via $.fn.data', function () {
    var $p = $('<p />')

    $p.data('foo', 'bar')

    expect($p.data('foo')).to.equal('bar')
  })

  test.add('data is element specific, not jQuery object specific', function () {
    var $p = $('<p />')
    var $q = $($p[0])

    $p.data('foo', 'bar')

    expect($q.data('foo')).to.equal('bar')
  })

  /* added in a central location */

  test.add('when data is added, an id is attached to the element', function () {
    var $p = $('<p />')

    $p.data('foo', 'bar')

    expect($p[0][$.expando]).to.be.a('number')
  })

  test.add('data is added in a central location', function () {
    var $p = $('<p />')

    $p.data('foo', 'bar')

    expect($.cache[$p[0][$.expando]]['data']['foo']).to.equal('bar')
  })

  /* data-* attributes */

  test.add('data can be initialised by data-* attributes', function () {
    var $p = $('<p data-foo="bar" />')

    expect($p.data('foo')).to.equal('bar')
  })

  test.add('data writes to its own store after reading from a data-* attribute', function () {
    var $p = $('<p data-foo="bar" />')

    var attrValue = $p.data('foo')

    $p.attr('data-foo', 'baz')

    var dataValue = $p.data('foo')

    expect(dataValue).to.equal(attrValue)
  })


  /**
   * Miscellany
   */

  /* camelCasing */

  test.add('data stores values as camelCased', function () {
    var $p = $('<p />')

    $p.data('foo-bar', 'baz')

    expect($p.data('fooBar')).to.equal('baz')
    expect($p.data('foo-bar')).to.equal('baz')

    expect($.cache[$p[0][$.expando]]['data']['fooBar']).to.equal('baz')
    expect($.cache[$p[0][$.expando]]['data']['foo-bar']).to.equal(undefined)
  })

  test.add('data will search for hyphen-separated data-* attributes', function () {
    var $p = $('<p data-foo-bar="baz" />')

    expect($p.data('fooBar')).to.equal('baz')
  })

  test.add('data will convert keys to camelCase', function () {
    var $p = $('<p />')

    $p.data('fooBar', 'baz')

    expect($p.data('foo-bar')).to.equal('baz')
  })

  /* private data */

  test.add('data stores data inside a field called "data"', function () {
    var o = {}

    $.data(o, 'foo', 'bar')

    expect(o[$.expando]['data']['foo']).to.equal('bar')
  })

  test.add('data stores private data just in the silo', function () {
    var o = {}

    $._data(o, 'foo', 'bar')

    expect(o[$.expando]['foo']).to.equal('bar')
  })

  test.add('_data can access the data silo', function () {
    var o = {}

    $.data(o, 'foo', 'bar')

    expect($._data(o, 'data')).to.eql({ foo: 'bar' })
  })

  /* telling elements and objects apart */

  test.add('data uses nodeType to test elemental nature', function () {
    var o = { nodeType: 1 }

    $.data(o, 'foo', 'bar')

    expect($.cache[o[$.expando]]['data']['foo']).to.equal('bar')
  })

  test.add('nodeType must be truthy and +nodeType || 1 must be 1 or 9', function () {
    var good = [
      { nodeType: 1 },
      { nodeType: 9 },
      { nodeType: 'string' },
      { nodeType: ['something', 'else'] },
      { nodeType: true }
    ]

    var bad = [
      { nodeType: 2 },
      { nodeType: '4' },
      { nodeType: 0 },
      { nodeType: false }
    ]

    _.each(good, function (o) {
      $.data(o, 'foo', 'bar')

      expect(o[$.expando]).to.be.a('number')
    })

    _.each(bad, function (o) {
      $.data(o, 'foo', 'bar')

      expect(o[$.expando]).not.to.be.a('number')
    })
  })

  /* $.noData */

  test.add('data does not let you add data to object, applet, embed', function () {
    var $embed = $('<embed />')
    var $applet = $('<applet />')
    var $object = $('<object />')

    _.each([$embed, $applet, $object], function ($$) {
      $$.data('foo', 'bar')

      expect($$.data('foo')).to.equal(undefined)
    })
  })

  test.add('data uses nodeName to block data', function () {
    var o = { nodeName: 'embed' }

    $.data(o, 'foo', 'bar')

    expect($.data(o, 'foo')).to.equal(undefined)
  })

  test.add('data exposes the blocker as $.noData', function () {
    $.noData['maxelement '] = true

    var o = { nodeName: 'maxelement' }

    $.data(o, 'foo', 'bar')

    expect($.data(o, 'foo')).to.equal(undefined)
  })

  test.add('$.noData can work conditionally based on classid', function () {
    $.noData['dataallowed '] = 'flag'

    var attribute = { getAttribute: function (key) { return this[key] } }

    var good = _.extend({ nodeName: 'dataAllowed', classid: 'flag' }, attribute)
    var bad = _.extend({ nodeName: 'dataAllowed' }, attribute)

    $.data(good, 'foo', 'bar')
    $.data(bad, 'foo', 'bar')

    expect($.data(good, 'foo')).to.equal('bar')
    expect($.data(bad, 'foo')).to.equal(undefined)
  })

  /* Elements can share data */

  test.add('elements can share data', function () {
    var $p = $('<p />')

    var $q = $('<p />')

    $p.data('foo', 'bar')

    $q[0][$.expando] = $p[0][$.expando]

    expect($q.data('foo')).to.equal('bar')

    $q.data('foo', 'baz')

    expect($p.data('foo')).to.equal('baz')
  })

  test.run()
})

;
