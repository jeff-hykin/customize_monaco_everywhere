// 
// monaco setup
// 
let interval = setInterval(() => {
    console.debug(`globalThis.monaco is:`,globalThis.monaco)
    if (globalThis.monaco) {
        clearInterval(interval)
        let monaco = globalThis.monaco
        var editor = monaco.editor.getEditors()[0]

        // 
        // settings
        // 
        editor.updateOptions({
            suggest: {
                onTriggerTimeout: 0, // Remove suggestion delay
            },
        })

        //
        // keybinds
        //
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, function () {
                editor.getAction("workbench.action.navigateBack").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, function () {
                editor.getAction("workbench.action.navigateForward").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.BracketLeft, function () {
                editor.getAction("editor.action.jumpToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.BracketRight, function () {
                editor.getAction("editor.action.jumpToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft, function () {
                editor.getAction("editor.action.selectToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight, function () {
                editor.getAction("editor.action.selectToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.CmdCtrl | monaco.KeyMod.Shift | monaco.KeyCode.Enter, function () {
                editor.getAction("editor.action.changeAll").run()
            })
            
            // tried to do multi-cursor fix for firefox, but it didnt work (might be a Zen Browser / MacOS problem)
            // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
            //     const selections = editor.getSelections()
            //     const newSelections = []
            //
            //     console.log(`here`)
            //
            //     for (const sel of selections) {
            //         let line = sel.positionLineNumber + 1
            //         if (line <= editor.getModel().getLineCount()) {
            //             newSelections.push(new monaco.Selection(line, sel.positionColumn, line, sel.positionColumn))
            //         } else {
            //             newSelections.push(sel)
            //         }
            //     }
            //
            //     editor.setSelections(selections.concat(newSelections))
            // })
        
        // 
        // snippets
        // 
        var suggestions = {
            "outt": {
                prefix: "outt",
                body: ["console.debug(`$1 is:`,$1)"],
                description: "Debug output to console",
            },
            if: {
                prefix: "if",
                body: ["if ($0) {", "    ", "}"],
            },
            else: {
                prefix: "else",
                body: [" else {", "    $0", "}"],
            },
            "else if": {
                prefix: "eif",
                body: [" else if ($1) {", "    ", "}"],
            },
            fori: {
                prefix: "fori",
                body: ["var i=-1", "for (var each of $0) {", "    i++", "    ", "}"],
            },
            "forof loop": {
                prefix: "forof",
                body: ["for (let each of $0) {", "    ", "}"],
                description: "creates a for loop",
            },
            "forentries loop": {
                prefix: "forentries",
                body: ["for (const [key, value] of Object.entries($0)) {", "", "}"],
                description: "creates a for loop",
            },
            try: {
                prefix: "try",
                body: ["try {", "    ", "} catch (error) {", "    ", "}"],
                description: "creates a for loop",
            },
            sleep: {
                prefix: "sleep",
                body: ["await new Promise(r=>setTimeout(r,${1:100}))"],
            },
            time: {
                prefix: "time",
                body: ["const startTime = (new Date()).getTime()", "$1", "const endTime = (new Date()).getTime()", "const duration = endTime - startTime", "${2:console.log(`$3 took \\${duration\\}ms`)}"],
            },
            def_zip: {
                prefix: "def_zip",
                body: ["function zip(...iterables) {", "    const innerIterZipLongSync = function* (...iterables) {", "        while (true) {", "            const nexts = iterables.map((each) => each.next())", "            // if all are done then stop", "            if (nexts.every((each) => each.done)) {", "                break", "            }", "            yield nexts.map((each) => each.value)", "        }", "    }", "    return [...innerIterZipLongSync(...iterables)]", "}", "$0"],
            },
            stringToUint8Array: {
                prefix: "stringToUint8Array",
                body: ["new TextEncoder().encode(${1:string})"],
            },
            uint8ArrayToString: {
                prefix: "uint8ArrayToString",
                body: ["new TextDecoder().decode(${1:array})"],
            },
            wrapAroundGet: {
                body: "function wrapAroundGet(number, list) { return list[((number % list.length) + list.length) % list.length] }"
            },
            "def_binary_search": {
                "prefix": "binary_search",
                "description": "binary_search",
                "body": [
                            "function binarySearch(params) {",
                            "    let { in: list, find: targetValue, toValue, isSorted } = params",
                            "    toValue = toValue || ((a)=>a)",
                            "    if (!isSorted) {",
                            "        list = [...list].sort((a,b)=>toValue(a)-toValue(b))",
                            "    }",
                            "    let lowIndex = 0",
                            "    let highIndex = list.length - 1",
                            "    let midIndex",
                            "    while (lowIndex <= highIndex) {",
                            "        midIndex = Math.floor((lowIndex + highIndex) / 2)",
                            "        const midValue = toValue(list[midIndex])",
                            "",
                            "        if (midValue === targetValue) {",
                            "            return [ midIndex-1, midIndex, midIndex+1 ] // Found the target, return its index",
                            "        } else if (midValue < targetValue) {",
                            "            lowIndex = midIndex + 1 // Target is in the right half",
                            "        } else {",
                            "            highIndex = midIndex - 1 // Target is in the left half",
                            "        }",
                            "    }",
                            "    // Target is not in the array",
                            "    // NOTE! lowIndex and highIndex are misnomers at this point!",
                            "    //       lowIndex > highIndex always",
                            "    return [ highIndex, null, lowIndex ]",
                            "}",
                            "// ex:",
                            "var [low, index, high] = binarySearch({",
                            "    find: 4.5,",
                            "    isSorted: true,",
                            "    toValue: each=>each.v,",
                            "    in: [ {v:0},{v:1}, {v:2}, {v:3}, {v:4}, {v:5}, {v:6}, {v:7}, {v:8}, {v:9}, {v:10} ],",
                            "})",
                ]
            },
            "sort": {
                "prefix": "sort",
                "body": [
                    ".sort((a,b,c)=>(c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )) // smallToBig",
                ]
            },
            "throw": {
                "prefix": "throw",
                "body": [
                    "throw Error(`$0`)"
                ],
                "description": "Throw an error with a message"
            },
            "raise": {
                "prefix": "raise",
                "body": [
                    "throw Error(`$0`)"
                ],
                "description": "Throw an error with a message"
            },
            "sortMapByKeys": {
                "prefix": "sortMapByKeys",
                "body": [
                    "// sortMapByKeys",
                    "var sorted = new Map([...$0.entries()].sort((a,b,c)=>(a=a[0],b=b[0],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "sortMapByValues": {
                "prefix": "sortMapByValues",
                "body": [
                    "// sortMapByValues",
                    "var sorted = new Map([...$0.entries()].sort((a,b,c)=>(a=a[1],b=b[1],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "sortObjectByKeys": {
                "prefix": "sortObjectByKeys",
                "body": [
                    "// sortObjectByKeys",
                    "var sorted = Object.fromEntries([...Object.entries($0)].sort((a,b,c)=>(a=a[0],b=b[0],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "sortObjectByValues": {
                "prefix": "sortObjectByValues",
                "body": [
                    "// sortObjectByValues",
                    "var sorted = Object.fromEntries([...Object.entries($0)].sort((a,b,c)=>(a=a[1],b=b[1],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "def_setSubtract": {
                "prefix": "def_setSubtract",
                "body": [
                    "function setSubtract({value, from}) {",
                    "    let source = from // this assignment is not just for naming (FYI)",
                    "    let detractor = value",
                    "    // we don't need to force the larger container to be a set",
                    "    // we want to do as little data copying/conversion as possible",
                    "    let sourceSize = source.size || source.length || 0",
                    "    if (sourceSize == null) { // convert iterator/generator",
                    "        source = new Set(source)",
                    "        sourceSize = source.size",
                    "    }",
                    "    // make sure detractor has a size (but do as little conversion as possible)",
                    "    let detractorSize = detractor.size || detractor.length || 0",
                    "    if (detractorSize == null) { // convert iterator/generator",
                    "        detractor = new Set(detractor)",
                    "        detractorSize = detractor.size",
                    "    }",
                    "    ",
                    "    // ",
                    "    // source is smaller => iterate over it",
                    "    // ",
                    "    if (sourceSize < detractorSize) {",
                    "        const outputSet = new Set() // required to avoid duplicates (if source is not a set)",
                    "        (detractor instanceof Set) || (detractor=new Set(detractor))",
                    "        for (const each of source) {",
                    "            // if the detractor wasn't going to remove it, then it belongs in the output",
                    "            if (!detractor.has(each)) {",
                    "                outputSet.add(each)",
                    "            }",
                    "        }",
                    "        return outputSet",
                    "    // ",
                    "    // detractor is smaller => iterate over it",
                    "    // ",
                    "    } else {",
                    "        // make sure source is a copy",
                    "        (source == from) && (source=new Set(source))",
                    "        // remove all the ones in detractor",
                    "        for (const eachValueBeingRemoved of detractor) {",
                    "            source.delete(eachValueBeingRemoved)",
                    "        }",
                    "        return source",
                    "    }",
                    "}",
                    "// non-mutating",
                    "var subset = setSubtract({value: setA, from: setB})"
                ],
            },
            "def_setSubtract": {
                "prefix": "def_setSubtract",
                "body": [
                    "function setSubtract({value, from}) {",
                    "    let source = from",
                    "    let detractor = value",
                    "    // make sure source has a size (but do as little conversion as possible)",
                    "    let sourceSize = source.size || source.length",
                    "    if (!sourceSize) {",
                    "        source = new Set(source)",
                    "        sourceSize = source.size",
                    "    }",
                    "    // make sure detractor has a size (but do as little conversion as possible)",
                    "    let detractorSize = detractor.size || detractor.length",
                    "    if (!detractorSize) {",
                    "        detractor = new Set(detractor)",
                    "        detractorSize = detractor.size",
                    "    }",
                    "    ",
                    "    // ",
                    "    // source is smaller => iterate over it",
                    "    // ",
                    "    if (sourceSize < detractorSize) {",
                    "        const outputSet = new Set() // required to avoid duplicates (if source is not a set)",
                    "        !(detractor instanceof Set) && (detractor=new Set(detractor))",
                    "        for (const each of source) {",
                    "            // if the detractor wasn't going to remove it, then it belongs in the output",
                    "            if (!detractor.has(each)) {",
                    "                outputSet.add(each)",
                    "            }",
                    "        }",
                    "        return outputSet",
                    "    // ",
                    "    // detractor is smaller => iterate over it",
                    "    // ",
                    "    } else {",
                    "        // make sure source is a copy",
                    "        !(source != from) && (source=new Set(source))",
                    "        // remove all the ones in detractor",
                    "        for (const eachValueBeingRemoved of detractor) {",
                    "            source.delete(eachValueBeingRemoved)",
                    "        }",
                    "        return source",
                    "    }",
                    "}",
                ],
            },
            
            // TODO: sort randomNormal, intersection
        }
            // maybe some graph-theory stuff
            function frequencyCount(iterable, {valueToKey=null, sort=false}={}) {
                valueToKey = valueToKey || ((each)=>each)
                const counts = new Map()
                for (let element of iterable) {
                    element = valueToKey(element)
                    counts.set(element, (counts.get(element)||0)+1)
                }
                if (sort) {
                    if (sort > 0) {
                        return new Map([...counts.entries()].sort((a,b)=>b[1]-a[1]))
                    }
                    return new Map([...counts.entries()].sort((a,b)=>a[1]-b[1]))
                }
                return counts
            }
            var sum = (list) => list.reduce((a, b) => (a-0) + (b-0), 0)
            function getIntBit(number, bitIndex) {
                return number >> bitIndex & 1
            }
            function setIntBit(number, bitIndex, value=1) {
                if (value) {
                    return number | (1 << bitIndex)
                } else {
                    return ~(~number | (1 << bitIndex))
                }
            }

            /**
             * All Possible Slices
             *
             * @example
             * ```js
             *     slices([1,2,3])
             *     // [
             *     //   [[1],[2],[3]],
             *     //   [[1],[2,3]],
             *     //   [[1,2],[3]],
             *     //   [[1,2,3]],
             *     // ]
             *     // note: doesnt contain [[1,3], [2]]
             * ```
             */
            const slices = function* (elements) {
                const slicePoints = count({ start: 1, end: numberOfPartitions.length - 1 })
                for (const combination of combinations(slicePoints)) {
                    combination.sort()
                    let prev = 0
                    const slices = []
                    for (const eachEndPoint of [...combination, elements.length]) {
                        slices.push(elements.slice(prev, eachEndPoint))
                        prev = eachEndPoint
                    }
                    yield slices
                }
            }

            /**
             * Combinations
             *
             * @example
             * ```js
             *     combinations([1,2,3])
             *     // [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
             *
             *     combinations([1,2,3], 2)
             *     // [[1,2],[1,3],[2,3]]
             *
             *     combinations([1,2,3], 3, 2)
             *     // [[1,2],[1,3],[2,3],[1,2,3]]
             * ```
             */
            const combinations = function* (elements, maxLength, minLength) {
                // derived loosely from: https://lowrey.me/es6-javascript-combination-generator/
                if (maxLength === minLength && minLength === undefined) {
                    minLength = 1
                    maxLength = elements.length
                } else {
                    maxLength = maxLength || elements.length
                    minLength = minLength === undefined ? maxLength : minLength
                }

                if (minLength !== maxLength) {
                    for (let i = minLength; i <= maxLength; i++) {
                        yield* combinations(elements, i, i)
                    }
                } else {
                    if (maxLength === 1) {
                        yield* elements.map((each) => [each])
                    } else {
                        for (let i = 0; i < elements.length; i++) {
                            for (const next of combinations(elements.slice(i + 1, elements.length), maxLength - 1, maxLength - 1)) {
                                yield [elements[i], ...next]
                            }
                        }
                    }
                }
            }
            // product
            // combinationOfChoices
            // permutation
            // json cacher
            // throttle
            // setinterval
            // jsdoc
            // proxy
        monaco.languages.registerCompletionItemProvider("javascript", {
            provideCompletionItems: function (model, position) {
                const word = model.getWordUntilPosition(position)
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                }

                return {
                    suggestions: [
                        {
                            label: "print",
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: "console.log($1)",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Log output to console",
                            range: range,
                        },
                        {
                            label: "todo",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "// TODO: $1",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Insert a TODO comment",
                            range: range,
                        },
                        ...Object.entries(suggestions).map(([key, { prefix, body, description }]) => ({
                            label: key,
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            insertText: typeof body == "string" ? body : body.join("\n"),
                            documentation: description,
                            range: range,
                        })),
                    ],
                }
            },
        })
    }
}, 500)