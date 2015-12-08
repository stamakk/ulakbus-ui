/**
 * @license Ulakbus-UI
 * Copyright (C) 2015 ZetaOps Inc.
 *
 * This file is licensed under the GNU General Public License v3
 * (GPLv3).  See LICENSE.txt for details.
 */


describe('form service module', function () {

    beforeEach(module('ulakbus'));
    beforeEach(module('formService'));
    var location;
    beforeEach(inject(function ($location, $injector) {
        location = $location;
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        authRequestHandler = $httpBackend.when('GET', /\.[0-9a-z]+$/i)
            .respond({userId: 'userX'}, {'A-Token': 'xxx'});
    }));

    describe('form service', function () {

        it('should generate url', inject(['Generator',
            function (Generator) {
                expect(Generator.group).not.toBe(null);
                var generated_url = Generator.makeUrl({url: 'test', form_params: {}});
                expect(generated_url).toEqual("//api.ulakbus.net/test/");
            }])
        );

        it('should generate form', inject(['Generator',
            function (Generator) {
                expect(Generator.generate).not.toBe(null);

                var scope = {form_params: {object_id: '123456'}};
                var data = {
                    forms: {
                        form: ['email', 'id', 'name'],
                        schema: {
                            properties: {
                                email: {title: 'email', type: 'email'},
                                id: {title: 'id', type: 'int'},
                                name: {title: 'name', type: 'string'}
                            }, required: [], type: 'object', title: 'servicetest'
                        },
                        model: {
                            email: 'test@test.com', id: 2, name: 'travolta'
                        }
                    },
                    token: "b1d8fa68ae3d47bdb580a89f76192447"
                };

                var form_json = {
                    form_params: {object_id: '123456'},
                    form: ['email', 'id', 'name'],
                    schema: {
                        properties: {
                            email: {title: 'email', type: 'email'},
                            id: {title: 'id', type: 'number'},
                            name: {title: 'name', type: 'string'}
                        }, required: [], type: 'object', title: 'servicetest'
                    },
                    model: {email: 'test@test.com', id: 2, name: 'travolta'},
                    token: "b1d8fa68ae3d47bdb580a89f76192447",
                    initialModel: {email: 'test@test.com', id: 2, name: 'travolta'},
                    object_id: '123456'
                };

                var form_generated = Generator.generate(scope, data);


                expect(form_generated).toEqual(form_json);
            }])
        );

        it('should prepare form items', inject(['Generator',
            function (Generator) {
                expect(Generator.prepareFormItems).not.toBe(null);

                var scope = {
                    form: ['email', 'id', 'name', 'save', 'select', 'date'],
                    schema: {
                        properties: {
                            email: {title: 'email', type: 'email'},
                            id: {title: 'id', type: 'int'},
                            name: {title: 'name', type: 'string'},
                            save: {title: 'save', type: 'submit'},
                            select: {title: 'select', type: 'select'},
                            date: {title: 'date', type: 'date'},
                            text_general: {title: 'text_general', type: 'text_general'},
                            model: {title: 'model', type: 'model'},
                            node: {title: 'Node', type: 'Node'},
                            listnode: {title: 'ListNode', type: 'ListNode'}
                        }, required: [], type: 'object', title: 'servicetest'
                    },
                    model: {
                        email: 'test@test.com', id: 2, name: 'travolta',
                        save: {title: 'save', type: 'submit'},
                        select: 2,
                        date: '12.12.2012',
                        text_general: 'test',
                        model: '32gy1ukf3qiryv',
                        node: '',
                        listnode: ''
                    },
                    form_params: {}
                };

                var form_json = {
                    form: ['email', 'id', 'name'],
                    schema: {
                        properties: {
                            email: {title: 'email', type: 'email'},
                            id: {title: 'id', type: 'number'},
                            name: {title: 'name', type: 'string'}
                        }, required: [], type: 'object', title: 'servicetest'
                    },
                    model: {email: 'test@test.com', id: 2, name: 'travolta'},
                    form_params: {}
                };

                var form_generated = Generator.prepareFormItems(scope);


                expect(form_generated).toEqual(form_json);
            }])
        );

        it('should format date', inject(['Generator',
            function (Generator) {
                expect(Generator.dateformatter).not.toBe(null);
                var generated_date = Generator.dateformatter('2001-01-01T01:00:00Z');
                expect(generated_date).toEqual('1.1.2001');
            }])
        );

        it('should group form', inject(['Generator',
            function (Generator) {
                expect(Generator.group).not.toBe(null);

                var group_json = {
                    group_objects: {
                        1: ['email', 'name'],
                        2: ['password']
                    }
                };
                var grouped_form = Generator.group(group_json);
                expect(grouped_form).toEqual(group_json);
            }])
        );

        it('should get form', inject(function (Generator, $httpBackend, RESTURL) {

                $httpBackend.expectPOST(RESTURL.url + 'add_student/', {cmd: 'add'})
                    .respond(200, {
                        forms: {
                            schema: {
                                type: "object",
                                properties: {
                                    name: {type: "string", minLength: 2, title: "Name", description: "Name or alias"},
                                    title: {
                                        type: "string",
                                        enum: ['dr', 'jr', 'sir', 'mrs', 'mr', 'NaN', 'dj']
                                    }
                                }
                            },

                            form: [
                                "*",
                                {
                                    type: "submit",
                                    title: "Save"
                                }
                            ],
                            model: {}
                        }
                    });

                var cred = {cmd: 'add'};
                Generator.get_form({url: 'add_student', form_params: cred})
                    .then(function (data) {
                        expect(data.form).toEqual(["*", {type: "submit", title: "Save"}]);
                    });

                $httpBackend.flush();
            })
        );

        it('should get list',
            inject(function (Generator, $httpBackend, RESTURL) {

                $httpBackend.expectPOST(RESTURL.url + 'test/personel', {
                        cmd: 'list',
                        model: "personel",
                        object_id: "5821bc25a90aa1"
                    })
                    .respond(200, {
                        items: {
                            "client_cmd": "list_objects",
                            "is_login": true,
                            "objects": [
                                ["Ad\u0131", "Soyad\u0131", "TC No", "Durum"],
                                ["4MsKRH9435cdKOzKCITNPml5bhB", "firstname", "lastname", "dksoap", false]
                            ],
                            "token": "0122b2843f504c15821bc25a90aa1370"
                        }
                    });

                var cred = {cmd: 'list', model: "personel", object_id: "5821bc25a90aa1"};
                Generator.get_list({url: 'test', form_params: cred})
                    .then(function (data) {
                        expect(data.data.items.token).toEqual("0122b2843f504c15821bc25a90aa1370");
                    });

                $httpBackend.flush();
            })
        );

        it('should submit form',
            inject(function (Generator, $httpBackend, RESTURL) {

                $httpBackend.expectPOST(RESTURL.url + 'student/add/testmodel')
                    .respond(200, {data: 'OK'});

                var scope = {
                    model: {email: 'test@test.com'},
                    form_params: {cmd: 'add', model: 'testmodel'},
                    token: '123456',
                    url: 'student/add'
                };
                Generator.submit(scope)
                    .success(function () {

                    })
                    .then(function (data) {
                        expect(data.data).toEqual({data: 'OK'});
                    });
                $httpBackend.flush();
            })
        );

        it('should validate email',
            inject(function (Generator) {
                var validEmails = [
                    'test@test.com',
                    'test@test.co.uk',
                    'test734ltylytkliytkryety9ef@jb-fe.com'
                ];

                var invalidEmails = [
                    'test@testcom',
                    'test@ test.co.uk',
                    'ghgf@fe.com.co.',
                    'tes@t@test.com',
                    ''
                ];

                for (var i in validEmails) {
                    var valid = Generator.isValidEmail(validEmails[i]);
                    expect(valid).toBeTruthy();
                }
                for (var i in invalidEmails) {
                    var valid = Generator.isValidEmail(invalidEmails[i]);
                    expect(valid).toBeFalsy();
                }
            })
        );

        it('should validate tcNo',
            inject(function (Generator) {
                var validTCNos = [
                    '12345678902',
                    '18307990654'
                ];

                var invalidTCNos = [
                    '00000000000',
                    '00000000002',
                    '12345678901',
                    '1234567892',
                    ''
                ];

                for (var i in validTCNos) {
                    var valid = Generator.isValidTCNo(validTCNos[i]);
                    expect(valid).toBeTruthy();
                }
                for (var i in invalidTCNos) {
                    var valid = Generator.isValidTCNo(invalidTCNos[i]);
                    expect(valid).toBeFalsy();
                }
            })
        );

        it('should validate date',
            inject(function (Generator) {
                var validDates = [
                    '12.12.2012',
                    '12/12/2012'
                ];

                var invalidDates = [
                    '00000000000',
                    'dsad',
                    '0.0.0',
                    '12.15.2012',
                    ''
                ];

                for (var i in validDates) {
                    var valid = Generator.isValidDate(validDates[i]);
                    console.log(validDates[i]);
                    expect(valid).toBeTruthy();
                }
                for (var i in invalidDates) {
                    console.log(invalidDates[i]);

                    var valid = Generator.isValidDate(invalidDates[i]);

                    console.log(valid)
                    expect(valid).toBeFalsy();
                }
            })
        );

        it('should get wf and redirect according to client_cmd',
            inject(function (Generator, $httpBackend, RESTURL) {


                $httpBackend.expectPOST(RESTURL.url + 'test/testModel?test=xyz123')
                    .respond(200, {
                        "client_cmd": "form",
                        "object": {
                            "ad": "name",
                            "soyad": "lastname",
                        },
                        forms: {
                            schema: {
                                type: "object",
                                properties: {
                                    name: {type: "string", minLength: 2, title: "Name", description: "Name or alias"},
                                    title: {
                                        type: "string",
                                        enum: ['dr', 'jr', 'sir', 'mrs', 'mr', 'NaN', 'dj']
                                    }
                                }
                            },

                            form: [
                                "*",
                                {
                                    type: "submit",
                                    title: "Save"
                                }
                            ],
                            model: {}
                        },
                        "token": "da73993f439549e7855fd82deafbbc99",
                        "is_login": true
                    });

                //scope.url = 'test';
                scope.form_params = {
                    param: 'test',
                    id: 'xyz123',
                    model: 'testModel',
                    object_id: 'xxx11',
                    wf: 'testModel'
                };

                scope.url = 'test';

                Generator.get_wf(scope);

                $httpBackend.flush();
                expect(location.path()).toEqual('/testModel/testModel/do/f');
            })
        );

        it('should return diff object',
            inject(function (Generator) {
                expect(Generator.get_diff).not.toBe(null);

                // test cases - testing for success
                var same_json = [
                    {email: 'test@test.com', id: 2, name: 'travolta'},
                    {email: 'test@test.com', id: 2, name: 'travolta'}
                ];

                // test cases - testing for failure
                var different_jsons = [
                    [
                        {email: 'test@test.com', id: 2, name: 'travolta'},
                        {email: 'test1@test.com', id: 2, name: 'john'}
                    ],
                    [
                        {id: 2, name: 'travolta'},
                        {email: 'test1@test.com', id: 2, name: 'john'}
                    ]
                ];

                var different_json = [
                    {},
                    {email: 'test1@test.com', id: 2, name: 'john'}
                ]

                var diff = {email: 'test1@test.com', name: 'john'};
                var diff2 = {email: 'test1@test.com', id: 2, name: 'john'};
                var nodiff = {};

                var same = Generator.get_diff(same_json[0], same_json[1]);
                expect(same).toEqual(nodiff);

                for (var json_obj in different_jsons) {
                    var different = Generator.get_diff(different_jsons[json_obj][1], different_jsons[json_obj][0]);
                    expect(different).toEqual(diff);
                }

                var different2 = Generator.get_diff(different_json[1], different_json[0]);
                expect(different2).toEqual(diff2);
            })
        );

    });

    describe('form service', function () {
        var location, rootScope, scope, ctrl;
        beforeEach(inject(function ($location, $rootScope) {
            location = $location;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            ctrl = $controller("CRUDCtrl", {$scope: scope});
        }));

    });

    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('form service modal controller', function () {

        it('should have ModalCtrl', inject(function ($controller) {
            expect($controller).toBeDefined();
        }));
    });

    // here begin the directive tests
    var compile, scope, directiveElem;

    beforeEach(function () {
        inject(function ($compile, $rootScope) {
            compile = $compile;
            scope = $rootScope.$new();
        });
        // directiveElem = getCompiledElement();
    });

    function getCompiledElement() {
        var element = angular.element('<div modal-for-nodes="Personel,ListNode,add"></div>');
        var compiledElement = compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    describe('modal for nodes directive', function () {

        it('should have div element', function () {
            var modalElement = getCompiledElement().find('div');
            expect(modalElement).toBeDefined();
            expect(modalElement.html()).not.toEqual('');
        });
    });
});