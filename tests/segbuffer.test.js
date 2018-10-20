var should = require('should');
var SeqBuffer = require('../lib/seqbuffer.js');

describe('Segbuffer', function() {


  it('should init correctly', function() {

    var sb = new SeqBuffer;

    sb._data.length.should.be.equal(1500);

    var sb = new SeqBuffer(null, 20);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(0);

    sb._data.compare(new Buffer(20).fill(0)).should.be.equal(0);
  });

  it('should add uint8', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addUInt8(1);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(1);

    sb.addUInt8(2);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(2);

    sb.addUInt8(99);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(3);

    sb._data.compare(new Buffer([1, 2, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);

  });

  it('should get uint8', function() {

    var sb = new SeqBuffer(new Buffer([1, 2, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getUInt8(1).should.be.equal(1);

    sb._r.should.be.equal(1);
    sb._w.should.be.equal(0);

    sb.getUInt8(1).should.be.equal(2);

    sb.getUInt8(1).should.be.equal(99);

    sb._r.should.be.equal(3);
    sb._w.should.be.equal(0);

  });

  it('should add uint16', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addUInt16(1);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(2);

    sb.addUInt16(2);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(4);

    sb.addUInt16(99);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(6);

    sb._data.compare(new Buffer([0, 1, 0, 2, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);

  });

  it('should get uint16', function() {

    var sb = new SeqBuffer(new Buffer([0, 1, 0, 2, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getUInt16(2).should.be.equal(1);

    sb._r.should.be.equal(2);
    sb._w.should.be.equal(0);

    sb.getUInt16(2).should.be.equal(2);

    sb._r.should.be.equal(4);
    sb._w.should.be.equal(0);

    sb.getUInt16(2).should.be.equal(99);

    sb._r.should.be.equal(6);
    sb._w.should.be.equal(0);

  });

  it('should add uint32', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addUInt32(1);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(4);

    sb.addUInt32(2);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(8);

    sb.addUInt32(99);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(12);

    sb._data.compare(new Buffer([0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);

  });

  it('should get uint32', function() {

    var sb = new SeqBuffer(new Buffer([0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getUInt32(4).should.be.equal(1);

    sb._r.should.be.equal(4);
    sb._w.should.be.equal(0);

    sb.getUInt32(4).should.be.equal(2);

    sb._r.should.be.equal(8);
    sb._w.should.be.equal(0);

    sb.getUInt32(4).should.be.equal(99);

    sb._r.should.be.equal(12);
    sb._w.should.be.equal(0);

  });

  it('should add ascii', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addASCII('');

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(0);

    sb.addASCII('abc');

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(3);

    sb._data.compare(new Buffer([97, 98, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);

  });

  it('should get ascii', function() {

    var sb = new SeqBuffer(new Buffer([97, 98, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getASCII(3).should.be.equal('abc');

    sb._r.should.be.equal(3);
    sb._w.should.be.equal(0);
  });

  it('should add utf8', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addUTF8('');

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(0);

    sb.addUTF8('i❤u');

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(5);

    sb._data.compare(new Buffer([0x69, 0xe2, 0x9d, 0xa4, 0x75, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);

  });

  it('should get utf8', function() {

    var sb = new SeqBuffer(new Buffer([0x69, 0xe2, 0x9d, 0xa4, 0x75, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getUTF8(5).should.be.equal('i❤u');

    sb._r.should.be.equal(5);
    sb._w.should.be.equal(0);
  });

  it('should work with fixed string', function() {

    var sb = new SeqBuffer(Buffer.from('abcdefghij'));

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(0);

    sb.addASCIIPad('pqs', 8);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(8);

    sb._data.compare(new Buffer([0x70, 0x71, 0x73, 0, 0, 0, 0, 0, 0x69, 0x6a])).should.be.equal(0);

    // Reset write pointer
    sb._w = 0;

    // Same with UTF8
    sb.addUTF8Pad('pqs', 8);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(8);

    sb._data.compare(new Buffer([0x70, 0x71, 0x73, 0, 0, 0, 0, 0, 0x69, 0x6a])).should.be.equal(0);
  });

  it('should add IPs', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addIPs(['1.2.3.4', '8.8.8.8', '192.255.238.238']);

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(12);

    sb._data.compare(new Buffer([1, 2, 3, 4, 8, 8, 8, 8, 192, 255, 238, 238, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);
  });

  it('should get IPs', function() {

    var sb = new SeqBuffer(new Buffer([1, 2, 3, 4, 8, 8, 8, 8, 192, 255, 238, 238, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getIPs(12).toString().should.be.equal(['1.2.3.4', '8.8.8.8', '192.255.238.238'].toString());

    sb._r.should.be.equal(12);
    sb._w.should.be.equal(0);
  });

  it('should add Mac', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addMac('1-2-3-4-5-6');

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(16);

    sb._data.compare(new Buffer([1, 2, 3, 4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);

  });

  it('should add Mac with offsetted word', function() {

    var sb = new SeqBuffer(null, 20);

    sb.addUInt16(4);

    sb.addMac('1-2-3-4-5-6');

    sb._r.should.be.equal(0);
    sb._w.should.be.equal(18);

    sb._data.compare(new Buffer([0, 4, 1, 2, 3, 4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).should.be.equal(0);
  });

  it('should get Mac', function() {

    var sb = new SeqBuffer(new Buffer([1, 2, 3, 4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getMAC(1, 6).should.be.equal('01-02-03-04-05-06');

    sb._r.should.be.equal(16);
    sb._w.should.be.equal(0);
  });

  it('should get Mac with offsetted byte', function() {

    var sb = new SeqBuffer(new Buffer([0, 0xff, 0xff, 0xff, 0xff, 0xce, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    sb.getUInt8();

    sb.getMAC(1, 6).should.be.equal('FF-FF-FF-FF-CE-FF');

    sb._r.should.be.equal(17);
    sb._w.should.be.equal(0);
  });

  it('should add mixed options - 1st', function() {

    var sb = new SeqBuffer(null, 30);

    sb.addOptions({
      1: '1.2.3.4',
      2: 99,
      3: '192.168.0.1',
      4: ['192.168.2.2', '66.55.44.33']
    });

    sb._data.compare(new Buffer([
      1, 4, 1, 2, 3, 4,
      2, 4, 0, 0, 0, 99,
      3, 4, 192, 168, 0, 1,
      4, 8, 192, 168, 2, 2, 66, 55, 44, 33,
      0, 0])).should.be.equal(0);
  });


  it('should get mixed options - 1st', function() {

    var sb = new SeqBuffer(new Buffer([
      1, 4, 1, 2, 3, 4,
      2, 4, 0, 0, 0, 99,
      3, 4, 192, 168, 0, 1,
      4, 8, 192, 168, 2, 2, 66, 55, 44, 33,
      255, 0]));

    sb.getOptions().should.deepEqual({
      '1': '1.2.3.4',
      '2': 99,
      '3': ['192.168.0.1'],
      '4': ['192.168.2.2', '66.55.44.33']});

    sb._r.should.be.equal(29);
    sb._w.should.be.equal(0);
  });

  it('should add mixed options - 2nd', function() {

    var sb = new SeqBuffer(null, 21);

    sb.addOptions({
      145: [1, 2, 3],
      80: false,
      56: 'whoo',
      57: 96,
      12: '',
      54: '192.168.2.2'
    });

    sb._data.compare(new Buffer([
      54, 4, 192, 168, 2, 2,
      56, 4, 119, 104, 111, 111,
      57, 2, 0, 96,
      145, 3, 1, 2, 3])).should.be.equal(0);
  });

  it('should get mixed options - 2st', function() {

    var sb = new SeqBuffer(new Buffer([
      54, 4, 192, 168, 2, 2,
      56, 4, 119, 104, 111, 111,
      57, 2, 0, 96,
      145, 3, 1, 2, 3,
      255, 0]));

    sb.getOptions().should.deepEqual({
      145: [1, 2, 3],
      56: 'whoo',
      57: 96,
      54: '192.168.2.2'
    });

    sb._r.should.be.equal(22);
    sb._w.should.be.equal(0);
  });

  it('should add UInt16s options', function() {

    var sb = new SeqBuffer(null, 10);

    sb.addOptions({
      25: [1, 2, 3]
    });

    sb._data.compare(new Buffer([
      25, 6, 0, 1, 0, 2, 0, 3, 0, 0])).should.be.equal(0);
  });

  it('should get UInt16s options', function() {

    var sb = new SeqBuffer(new Buffer([
      25, 6, 0, 1, 0, 2, 0, 3, 0, 0]));

    sb.getOptions().should.deepEqual({
      25: [1, 2, 3]
    });

    sb._r.should.be.equal(10);
    sb._w.should.be.equal(0);
  });

  it('should add nothing for empty options', function() {

    var sb = new SeqBuffer(new Buffer(20).fill(32));

    sb.addOptions({
      /* void */
    });

    sb._data.compare(new Buffer(20).fill(32)).should.be.equal(0);
  });

  it('should get hex correctly', function() {

    var sb = new SeqBuffer(new Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9]));

    sb.getInt8().should.be.equal(1);
    sb.getInt8().should.be.equal(2);
    sb.getInt8().should.be.equal(3);

    sb.getHex(5).should.be.equal('0405060708');

    sb.getInt8().should.be.equal(9);

  });

});
