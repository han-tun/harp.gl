/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";

/**
 * Insert shader includes after another shader include.
 *
 * @param shaderContent Original string.
 * @param shaderName String to append to.
 * @param insertedShaderName String to append after string `shaderA`.
 * @param addTab If `true`, a tab character will be inserted before `shaderB`.
 */
export function insertShaderInclude(
    shaderContent: string,
    shaderName: string,
    insertedShaderName: string,
    addTab?: boolean
): string {
    const tabChar = addTab === true ? "\t" : "";

    const result = shaderContent.replace(
        `#include <${shaderName}>`,
        `#include <${shaderName}>
${tabChar}#include <${insertedShaderName}>`
    );
    return result;
}

export interface ForcedBlending {
    /**
     * This material has `blending` always enabled regardless of `opacity` setting.s
     */
    forcedBlending?: true;
}

/**
 * THREE.js is enabling blending only when transparent is `true` or when a blend mode
 * different than `NormalBlending` is set.
 * Since we don't want to set transparent to true and mess up the render order we set
 * `CustomBlending` with the same parameters as the `NormalBlending`.

 * @param material `Material` that should use blending
 * @note This function should not be used in frame update after material has been passed to WebGL.
 * In such cases use [[enableBlending]] instead.
 */
export function enforceBlending(
    material: (THREE.Material | THREE.ShaderMaterialParameters) & ForcedBlending
) {
    if (material.transparent) {
        // Nothing to do
        return;
    }

    enableBlending(material);
    material.forcedBlending = true;
}

/**
 * Enable alpha blending using THREE.CustomBlending setup.
 *
 * Function enables blending using one of predefined modes, for both color and alpha components:
 * - Src: [[THREE.SrcAlphaFactor]], Dst: [[THREE.OneMinusSrcAlphaFactor]]
 * - Src: [[THREE.OneFactor]], Dst: [[THREE.OneMinusSrcAlphaFactor]]
 * The second blending equation is used when [[THREE.Material.premultipliedAlpha]] is enabled
 * for this material.
 *
 * @param material The material or material parameters to modify.
 * @param isUpdate Set to true if you want to notify about material change, required only if you
 * change blend mode after material has been created and passed to WebGL, it does not have meaning
 * when [[THREE.ShaderMaterialParameters]] are passed into function. By default set to [[false]].
 */
export function enableBlending(
    material: (THREE.Material | THREE.ShaderMaterialParameters) & ForcedBlending,
    isUpdate: boolean = false
) {
    if (
        material.transparent ||
        material.forcedBlending ||
        material.blending === THREE.CustomBlending
    ) {
        // Nothing to do
        return;
    }

    material.blending = THREE.CustomBlending;
    if (material.premultipliedAlpha === true) {
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.OneMinusSrcAlphaFactor;
        material.blendSrcAlpha = THREE.OneFactor;
        material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    } else {
        material.blendSrc = THREE.SrcAlphaFactor;
        material.blendDst = THREE.OneMinusSrcAlphaFactor;
        material.blendSrcAlpha = THREE.OneFactor;
        material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    }
    if (isUpdate && material instanceof THREE.Material) {
        material.needsUpdate = true;
    }
}

/**
 * Disable alpha blending using THREE.CustomBlending mode, switches to [[THREE.NormalBlending]].
 *
 * @see enableBlending.
 * @param material The material or material parameters to modify.
 * @param isUpdate Set to true if you want to notify about material change, required only if you
 * change blend mode after material has been created (in frame update), it does not have meaning
 * when you pass [[THREE.ShaderMaterialParameters]] into function. By default set to [[false]].
 */
export function disableBlending(
    material: (THREE.Material | THREE.ShaderMaterialParameters) & ForcedBlending,
    isUpdate: boolean = false
) {
    if (
        material.transparent ||
        material.forcedBlending ||
        material.blending === THREE.NormalBlending
    ) {
        // Nothing to do
        return;
    }

    material.blending = THREE.NormalBlending;

    if (isUpdate && material instanceof THREE.Material) {
        material.needsUpdate = true;
    }
}
