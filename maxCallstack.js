/* eslint-disable no-console */
// https://2ality.com/2014/04/call-stack-size.html

function computeMaxCallStackSize() {
	try {
		return 1 + computeMaxCallStackSize()
	} catch (_e) {
		// Call stack overflow
		return 1
	}
}

console.log(computeMaxCallStackSize())
